export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { cipherB64 } = await req.json();

    if (!cipherB64) {
      return NextResponse.json({ error: 'Missing cipherB64 parameter' }, { status: 400 });
    }

    const key = Buffer.from(process.env.SENSOR_AES_KEY_B64!, 'base64');
    const iv  = Buffer.from(process.env.SENSOR_AES_IV_B64!,  'base64');
    const ct  = Buffer.from(cipherB64, 'base64');
    
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    decipher.setAutoPadding(true);
    
    let plaintext = decipher.update(ct, undefined, 'utf8');
    plaintext += decipher.final('utf8');

    return NextResponse.json({ plaintext });
  } catch (error: any) {
    console.error('Decryption error:', error);
    return NextResponse.json({ error: 'Decryption failed', details: error.message }, { status: 500 });
  }
}
