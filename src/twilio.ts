import twilio from "twilio";

let twilioClient: twilio.Twilio | null = null;

export function getTwilioClient(): twilio.Twilio | null {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !accountSid.startsWith("AC") || !authToken) {
      console.warn("TWILIO_ACCOUNT_SID (must start with AC) and TWILIO_AUTH_TOKEN are required to send SMS. Skipping Twilio initialization.");
      return null;
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

export async function sendParentNotification(to: string, message: string) {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.log(`[Mock SMS to ${to}]: ${message}`);
      return true; // Return true to simulate success when Twilio is not configured
    }
    const from = process.env.TWILIO_PHONE_NUMBER;
    if (!from) {
      console.warn("TWILIO_PHONE_NUMBER is required. Skipping SMS.");
      return false;
    }
    await client.messages.create({
      body: message,
      from,
      to,
    });
    console.log(`Notification sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Failed to send Twilio notification:", error);
    return false;
  }
}
