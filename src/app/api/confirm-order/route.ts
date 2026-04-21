import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Webhook URL from environment variables
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    
    if (!webhookUrl || webhookUrl.includes('your_script_id')) {
      console.warn('Webhook URL not configured correctly. Logging to console instead.');
      console.log('Order Data:', data);
      return NextResponse.json({ success: true, message: 'Simulated log (webhook not configured)' });
    }

    // Send POST request to Google Apps Script Webhook
    // Google Apps Script usually expects form-urlencoded or plain text/json depending on setup
    // We send it as JSON string in the body
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Google Sheets Webhook responded with status: ${response.status}`);
    }

    const result = await response.text();
    return NextResponse.json({ success: true, result });
    
  } catch (error) {
    console.error('Error logging order to Google Sheets:', error);
    return NextResponse.json({ error: 'Failed to log order' }, { status: 500 });
  }
}
