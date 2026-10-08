import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;

        const body = {
            prompt: prompt,
            steps: 4,
        };

        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (res.status === 429) {
            return NextResponse.json(
                { error: 'Daily free limit reached. Try again tomorrow.' },
                { status: 429 }
            );
        }

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Cloudflare Error:', errorText);
            return NextResponse.json({ error: errorText }, { status: res.status });
        }

        // --- تشخیص نوع خروجی ---
        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            // حالت JSON: عکس داخل result.image است
            const data = await res.json();
            const base64Image = data?.result?.image;

            if (!base64Image) {
                console.error('No image in JSON response:', data);
                return NextResponse.json(
                    { error: 'No image generated', raw: data },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                image: `data:image/png;base64,${base64Image}`,
            });
        } else {
            // حالت باینری: عکس به صورت خام برمی‌گردد
            const arrayBuffer = await res.arrayBuffer();
            const base64Image = Buffer.from(arrayBuffer).toString('base64');

            return NextResponse.json({
                image: `data:image/png;base64,${base64Image}`,
            });
        }
    } catch (e: any) {
        console.error('Server Error:', e);
        return NextResponse.json(
            { error: e.message || 'Server error' },
            { status: 500 }
        );
    }
}