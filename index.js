const express = require('express');
const app = express();
const cors = require('cors');
const nodemailer = require('nodemailer');
const Member = require('./models/Member');
app.use(express.json());
require('dotenv').config();

app.use(cors());

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const PORT = process.env.PORT || 8000;
const fileupload = require("express-fileupload");
app.use(fileupload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

const {databaseConnect} = require('./config/database');
databaseConnect();

const cloudinary = require("./config/cloudinary");
cloudinary.cloudinaryConnect();

const verifyToken = require('./middlewares/verifyToken'); 
const StudentRep = require('./models/studentRep');
const Faculty = require('./models/facultyAdvisor');
const CentralOffice = require('./models/centralOffice');
const Club = require('./models/club');
const DepartmentalSocieties = require('./models/DepartmentalSocieties');
const ProfessionalSocieties = require('./models/ProfessionalSocieties');
const Communities = require('./models/Communities');
const Event = require("./models/event");

async function getEntityCounts() {
  try {
    const clubCount = await Club.countDocuments({});
    const communityCount = await Communities.countDocuments({});
    const departmentalSocietyCount = await DepartmentalSocieties.countDocuments({});
    const professionalSocietyCount = await ProfessionalSocieties.countDocuments({});

    const formattedOutput = {
      clubs: {
        label: "Club",
        count: clubCount
      },
      communities: {
        label: "Community",
        count: communityCount
      },
      departmentalSocieties: {
        label: "Departmental Society",
        count: departmentalSocietyCount
      },
      professionalSocieties: {
        label: "Professional Society",
        count: professionalSocietyCount
      }
    };

    return { success: true, data: formattedOutput };
  } catch (error) {
    console.error('Error fetching counts:', error);
    return { success: false, message: 'Server Error' };
  }
}

async function getEventCounts() {
  try {
    const weekly = await Event.countDocuments({Eventtype:'weekly'});
    const monthly = await Event.countDocuments({Eventtype:'monthly'});
    const flagship = await Event.countDocuments({Eventtype:'flagship'});
  
    return {
      weekly: weekly,
      monthly: monthly,
      flagship: flagship
    };
  } catch (error) {
    console.error('Error fetching event counts:', error);
    return { error: 'An error occurred while fetching event counts' };
  }
}

// Route imports
const departmentRoutes = require('./routes/departmentRoutes');
app.use('/api/departmentRoutes', departmentRoutes);

const clusterRoutes = require('./routes/clustersRoutes');
app.use('/api/cluster', clusterRoutes);

const clubRoutes = require('./routes/clubRoute');
app.use('/api/clubRoutes', clubRoutes);

const departmentalSocietiesRoutes = require('./routes/departmentSocieties');
app.use('/api/deptSocieties', departmentalSocietiesRoutes);

const professionalSocietiesRoutes = require('./routes/professionalSocieties');
app.use('/api/proffSocieties', professionalSocietiesRoutes);

const communitiesRoutes = require('./routes/communitiesRoutes');
app.use('/api/communitiesRoutes', communitiesRoutes);

const studentRepRoutes = require('./routes/studentRepCreateRoutes');
app.use('/api/studentRep', studentRepRoutes);

const facultyAdvRoutes = require('./routes/facultyAdvisorRoutes');
app.use('/api/facultyAdv', facultyAdvRoutes);

const loginRoute = require('./routes/loginRoutes');
app.use('/api/login', loginRoute);
 
const centralRoute = require('./routes/centralRoutes');
app.use('/api/central', centralRoute);

const eventRoute = require('./routes/eventRoute');
app.use('/api/event', eventRoute);

const memberRoute = require('./routes/members');
app.use('/api/member',memberRoute);

app.get('/api/me', verifyToken, async (req, res) => {
   try {
      const { id, role } = req.user;
  
      let user;
      if (role === 'Student Rep') {
        user = await StudentRep.findById(id);
      } else if (role === 'Faculty') {
        user = await Faculty.findById(id);
      } else if (role === 'Central Office') {
        user = await CentralOffice.findById(id);
      }
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      return res.status(200).json({
        success: true,
        user: {
          name: user.name || user.eid || user.uid,
          role,
          entity: user.club
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
});

app.get('/api/entity-counts', async (req, res) => {
  try {
    const counts = await getEntityCounts();
    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entity counts' });
  }
});

app.get('/api/event-counts', async (req, res) => {
  try {
    const counts = await getEventCounts();
    res.status(201).json({
      success: true,
      data: counts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events count' });
  }
});

const otpStore = new Map();
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const otp = generateOtp();
  const expirationTime = Date.now() + OTP_EXPIRY_TIME;

  otpStore.set(email, { otp, expirationTime });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'harshitbakshi83@gmail.com',
      pass: 'yjyfmpmfvfznjadf',
    },
  });

  const mailOptions = {
    from: 'harshitbakshi83@gmail.com',
    to: email, 
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`, 
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'OTP sent successfully!' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
  }
});

async function validateOtp(email, otp) {
  if (!email || !otp) {
    return {
      success: false,
      message: 'Email and OTP are required.'
    };
  }

  const storedOtpData = otpStore.get(email);

  if (!storedOtpData) {
    return {
      success: false,
      message: 'No OTP found for this email.'
    };
  }

  const { otp: storedOtp, expirationTime } = storedOtpData;

  if (Date.now() > expirationTime) {
    otpStore.delete(email);
    return {
      success: false,
      message: 'OTP has expired. Please request a new one.'
    };
  }

  console.log('Stored OTP:', storedOtp);
  console.log('Provided OTP:', otp);

  if (storedOtp === otp) {
    otpStore.delete(email);
    return { success: true, message: 'OTP verified successfully!' };
  } else {
    return { success: false, message: 'Invalid OTP. Please try again.' };
  }
}

app.post('/api/submit-form', async (req, res) => {
  const { name, email, uid, otp, entityType, entityId } = req.body;

  if (!name || !email || !uid || !otp || !entityType || !entityId) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const otpValidationResult = await validateOtp(email, otp);
    if (!otpValidationResult.success) {
      return res.status(400).json({ message: otpValidationResult.message });
    }

    let entity;
    switch (entityType) {
      case 'Club':
        entity = await Club.findOne({ ProposedEntityName: entityId });
        break;
      case 'Communities':
        entity = await Communities.findOne({ ProposedEntityName: entityId });
        break;
      case 'ProfessionalSocieties':
        entity = await ProfessionalSocieties.findOne({ ProposedEntityName: entityId });
        break;
      case 'DepartmentalSocieties':
        entity = await DepartmentalSocieties.findOne({ ProposedEntityName: entityId });
        break;
      default:
        return res.status(400).json({ message: 'Invalid entity type.' });
    }

    if (!entity) {
      return res.status(404).json({ message: 'Entity not found.' });
    }

    const newMember = new Member({
      name,
      email,
      uid, 
      entityType,
      entityRef: entity._id,
      otp,
      otpExpiry: Date.now(), 
    });

    await newMember.save();

    return res.status(201).json({ message: 'Member successfully registered and pending approval.' });
  } catch (error) {
    console.error('Error creating member:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

app.listen(PORT, () => {
   console.log(`The server is listening at port no: ${PORT}`);
});