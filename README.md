# simple-email-sender
This is a simple Node e-mail sender. It ultlizes third-party e-mail server provider such as:

  [SendGrid](https://sendgrid.com/)
  
  [Mailgun](https://Mailgun.com/)
  
  [Amazon SES](https://aws.amazon.com/ses/)
  
  to send e-mails.

To make use of this util:

1.Install the packge though npm: 
```
npm install simple-email-sender
```


2.Get your own api keys from [SendGrid](https://sendgrid.com/),[Mailgun](https://Mailgun.com/), or [Amazon SES](https://aws.amazon.com/ses/).


3.Create your keys.env in your project like:
```
SENDGRID_API_KEY=xxxxx
MAILGUN_API_KEY=xxxx
MAILGUN_DOMAIN=xxxx
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
```


4.Start using it to send email
```javascript
const sender = new require('simple-email-sender')();
msg = {
  "to":"to@test.com",
  "from":"from@text.com",
  "subject":"mail",
  "text":"OK"
};
try{
    const result = await sender.send(msg);
    console.log(result);
}
catch(e){
    console.log(e);
}
```

