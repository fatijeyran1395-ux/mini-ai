import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt, imageBase64 } = await req.json();
        if (!prompt || !imageBase64) {
            return NextResponse.json({ error: 'Prompt and image are required' }, { status: 400 });
        }

        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;

        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('input_image_0', new Blob([imageBuffer], { type: 'image/png' }), 'input.png');
        formData.append('steps', '8');       // برای img2img کیفیت بالاتر نیاز است
        formData.append('guidance', '3.5');
        formData.append('width', '1024');
        formData.append('height', '1024');

        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-2-dev`;

        const res = await fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiToken}` },
            body: formData,
        });

        if (res.status === 429) {
            return NextResponse.json(
                { error: 'Daily free limit reached. Try again tomorrow.' },
                { status: 429 }
            );
        }

        if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json({ error: errorText }, { status: res.status });
        }

        const data = await res.json();
        const base64Image = data?.result?.image;
        if (!base64Image) {
            return NextResponse.json({ error: 'No image generated', raw: data }, { status: 500 });
        }

        return NextResponse.json({ image: `data:image/png;base64,${base64Image}` });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}