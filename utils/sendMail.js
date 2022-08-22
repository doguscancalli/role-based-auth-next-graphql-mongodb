import { GraphQLYogaError } from '@graphql-yoga/node'
import sgMail from '@sendgrid/mail'

const sendMail = async (to, from, subject, text) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const data = {
    to,
    from,
    subject,
    text,
  }
  try {
    await sgMail.setApiKey(process.env.SENDGRID_API_KEY).send(data)
    return true
  } catch (err) {
    throw new GraphQLYogaError(err)
  }
}

export default sendMail
