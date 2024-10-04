const nodemailer = require('nodemailer');
const Member = require('../models/Member');
const Event = require('../models/event');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'harshitbakshi83@gmail.com',
    pass: 'yjyfmpmfvfznjadf',
  },
});
exports.acceptanceMail =  async (email,entity)=>{
    if (!email) {
        console.log("email missing");
        return { message: 'Email is required.' };
      }

    
      const mailOptions = {
        from: 'harshitbakshi83@gmail.com',
        to: email, 
        subject: 'You have been accepted.',
        text: `Your have been accepted as a member by the ${entity} Club.`, 
      };
    
      try {
        await transporter.sendMail(mailOptions);
        console.log("done");
        return { message: 'approved sent successfully!' };
      } catch (error) {
        console.error('Error sending OTP:', error);
        return { message: 'Failed to send OTP. Please try again later.' };
      }
}
exports.rejectionMail =  async (email,club)=>{
    if (!email) {
        return { message: 'Email is required.' };
      }
    
    

    
      const mailOptions = {
        from: 'harshitbakshi83@gmail.com',
        to: email, 
        subject: 'Sorry!.',
        text:`We are sorry to inform you that the ${club} Club has decided to not go forward with your application.`, 
      };
    
      try {
        await transporter.sendMail(mailOptions);
        return{ message: 'OTP sent successfully!' };
      } catch (error) {
        console.error('Error sending OTP:', error);
        return{ message: 'Failed to send OTP. Please try again later.' };
      }
}

exports.appliedSuccessfully = async (email,club,ticket)=>{
  if (!email) {
    return { message: 'Email is required.' };
  }

  const mailOptions = {
    from: 'harshitbakshi83@gmail.com',
    to: email, 
    subject: 'Application recieved!.',
    text: `This is to inform you that we have recieved your application for the ${club} club with the following ticket : ${ticket}.
    Kindly refer to this ticket for further interactions.`, 
  };

  try {
    await transporter.sendMail(mailOptions);
    return{ message: 'Application recieved successfully!' };
  } catch (error) {
    console.error('Error sending mail :', error);
    return{ message: 'Failed to send mail. Please try again later.' };
  }
}


exports.inviteMembersByEntity = async (req, res) => {
    try {
        const { entityRef,eventRef } = req.query;
        const event = await Event.findById(eventRef);
        const eventName = event.name; 
        const date= event.date.startDate;
        const venue = event.venue;
        const members = await Member.find({ entityRef: entityRef, approval: true }); 
        
        if (members.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No approved members found for this entity.',
            });
        }

        const emailPromises = members.map(member => {
            const mailOptions = {
                from: 'your-email@gmail.com',
                to: member.email,
                subject: `Invitation to ${eventName} from ${entityRef}`,
                text: `Dear ${member.name},\n\nYou are invited to ${eventName} event organized on ${date} at ${venue}. We look forward to your participation.\n\nBest Regards,\nYour Team`,
            };

            return transporter.sendMail(mailOptions);
        });

        await Promise.all(emailPromises);

        return res.status(200).json({
            success: true,
            message: 'Invitation emails sent successfully to all approved members.',
        });
    } catch (err) {
        console.error(`Error sending invitation emails: ${err.message}`);
        return res.status(500).json({
            success: false,
            message: `Error sending emails: ${err.message}`,
        });
    }
};