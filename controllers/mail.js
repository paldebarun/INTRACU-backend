const nodemailer = require('nodemailer');

exports.acceptanceMail =  async (email,entity)=>{
    if (!email) {
        console.log("email missing");
        return { message: 'Email is required.' };
      }
    
    
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
        subject: 'Sorry!.',
        text: `We are sorry to inform you that the ${club} Club has decided to not go forward with your application.`, 
      };
    
      try {
        await transporter.sendMail(mailOptions);
        return{ message: 'OTP sent successfully!' };
      } catch (error) {
        console.error('Error sending OTP:', error);
        return{ message: 'Failed to send OTP. Please try again later.' };
      }
}