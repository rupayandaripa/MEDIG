import nodemailer from 'nodemailer'
import { ConfidentialClientApplication } from '@azure/msal-node'

// export {transporter}

const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`, // Tenant ID from Azure
    //clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/auth/callback'
  },
};



export { msalConfig };