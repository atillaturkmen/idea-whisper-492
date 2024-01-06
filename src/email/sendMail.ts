const ElasticEmail = require('@elasticemail/elasticemail-client');

const defaultClient = ElasticEmail.ApiClient.instance;
const apikey = defaultClient.authentications['apikey'];
apikey.apiKey = process.env.EMAIL_API_KEY;

const api = new ElasticEmail.EmailsApi()

const callback = function(error:any, data:any, response:any) {
    if (error) {
        console.error(error);
    } else {
        //console.log('API called successfully.');
    }
};

export function sendMail(emailAddress:string, link:string): void {
    let email = ElasticEmail.EmailMessageData.constructFromObject({
        Recipients: [
            new ElasticEmail.EmailRecipient(emailAddress)
        ],
        Content: {
            Body: [
                ElasticEmail.BodyPart.constructFromObject({
                    ContentType: "HTML",
                    Content: "Here is your visitor link: <a href=\"" + link + "\">" + link + "</a>",
                })
            ],
            Subject: "Idea Whisper Discussion Link",
            From: "Idea Whisper <cmpe492@proton.me>"
        }
    });
    api.emailsPost(email, callback);
}
