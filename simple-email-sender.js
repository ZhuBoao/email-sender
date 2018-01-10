// Load the enviornment parameters including api-keys and domains
require('dotenv').config({path: 'keys.env'});

// email-sender support 3 default email server provider:
// SendGrid, Mailgun and Amazon SES
class EmailSender {

    // constructor receive apikeys as params, if there is no apikeys input,
    // it will load the .env file as apikeys.
    constructor(params) {
        this.sgMailReady = false;
        this.mailgunReady = false;
        this.AWSReady = false;
        // load user defined keys
        if (params){
            if (params.hasOwnProperty('SENDGRID_API_KEY')) {
                this.sgMail = require('@sendgrid/mail');
                this.sgMail.setApiKey(params.SENDGRID_API_KEY);
                this.sgMailReady = true;
            }
            if (params.hasOwnProperty('MAILGUN_API_KEY')
                && params.hasOwnProperty('MAILGUN_DOMAIN')) {
                this.mailgun = require("mailgun-js")({apiKey: params.MAILGUN_API_KEY, domain: params.MAILGUN_DOMAIN});
                this.mailgunReady = true;
            }
            if (params.hasOwnProperty('AWS_ACCESS_KEY_ID') &&
                params.hasOwnProperty('AWS_SECRET_ACCESS_KEY')) {
                this.AWS = require('aws-sdk');
                this.ses = new this.AWS.SES({
                    apiVersion: '2010-12-01',
                    region: 'us-east-1',
                    endpoint: 'email.us-east-1.amazonaws.com',
                    accessKeyId: params.AWS_ACCESS_KEY_ID,
                    secretAccessKey: params.AWS_SECRET_ACCESS_KEY
                });
                this.AWSReady = true;
            }
        }
        // if no valid user-defined key, load standby key from .env file
        if (!this.sgMailReady && !this.mailgunReady && !this.AWSReady) {
            this.sgMail = require('@sendgrid/mail');
            this.mailgun = require("mailgun-js")({
                apiKey: process.env.MAILGUN_API_KEY,
                domain: process.env.MAILGUN_DOMAIN
            });
            this.AWS = require('aws-sdk');
            this.sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            this.ses = new this.AWS.SES({
                apiVersion: '2010-12-01',
                region: 'us-east-1',
                endpoint: 'email.us-east-1.amazonaws.com',
                accessKeyId: process.env.AKIAJRO5DK3MNLAABGCA,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            });
            this.sgMailReady = true;
            this.mailgunReady = true;
            this.AWSReady = true;
        }
    }


    //send the email. Supporting both callback and promise.
    async send(message, callback) {
        if (!message.to) {
            throw new Error('Message must have a recipient!')
        }
        if (!message.from) {
            throw new Error('Message must have a sender!')
        }
        if (!message.subject) {
            throw new Error('Message must have a subject!')
        }
        if (!message.text) {
            throw new Error('Message must have content!')
        }

        const sendBySgMail = async (message) => {
            try {
                console.debug("Trying to send email by Sgmail.");
                const result = await this.sgMail.send(message);
                console.debug("Successfully send email by Sgmail.");
                return Promise.reject(result);
            }
            catch (err) {
                console.debug("Failed.");
                return Promise.resolve(message);
            }
        };

        const sendByMailgun = async (message) => {
            try {
                console.debug("Trying to send email by Mailgun.");
                const result = await this.mailgun.messages().send(message);
                console.debug("Successfully send email by Mailgun.");
                return Promise.reject(result);
            }
            catch (err) {
                console.debug("Failed");
                return Promise.resolve(message);
            }
        };

        const sendByAWS = async (message) => {
            const params = {
                Destination: {
                    BccAddresses: [],
                    CcAddresses: [],
                    ToAddresses: [
                        message.to
                    ]
                },
                Message: {
                    Body: {
                        Text: {
                            Charset: "UTF-8",
                            Data: message.text
                        }
                    },
                    Subject: {
                        Charset: "UTF-8",
                        Data: message.subject
                    }
                },
                ReplyToAddresses: [],
                Source: message.from,
            };

            const sendEmailAsync = (param) => {
                return new Promise((resolve, reject) => {
                    this.ses.sendEmail(param, (err, data) => {
                        if (err !== null) return reject(err);
                        resolve(data);
                    });
                });
            };

            try {
                const result = await sendEmailAsync(params);
                return Promise.reject(result);
            }
            catch (err) {
                return Promise.resolve(message);
            }

        };

        return new Promise((resolve, reject) => {
            Promise.resolve(message)
                .then((message)=>{
                    if (this.sgMailReady) {
                        return sendBySgMail(message);
                    }
                    else return message;
                })
                .then((message)=>{
                    if (this.mailgunReady) {
                        return sendByMailgun(message);
                    }
                    else return message;
                })
                .then((message)=>{
                    if (this.AWSReady) {
                        return sendByAWS(message);
                    }
                    else return message;
                })
                .then(() => {
                    if (callback) {
                        callback("Failed to send email.", null);
                    }
                    reject("Failed to send email.")
                })
                .catch((delivery) => {
                    if (callback) {
                        callback(null, "Successfully delivery.");
                    }
                    resolve("Successfully delivery.")
                })
        });
    }

}

function create (options) {
  return new EmailSender(options);
}

module.exports = create;
