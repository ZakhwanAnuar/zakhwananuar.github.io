/* ================================================================
   data/blog.js
   ================================================================

   HOW TO ADD A BLOG POST:
   1. Copy one of the objects below
   2. Paste it at the TOP of the array (newest first)
   3. Fill in all the fields
   4. Write your content in the `content` field using Markdown syntax
   5. Save the file

   FIELDS:
   - id:       Unique string, no spaces (used in URL: blog-post.html?id=YOUR_ID)
   - title:    Post title
   - date:     Display date string, e.g. "April 2026"
   - tags:     Array of tag strings, e.g. ["thoughts", "security", "life"]
   - summary:  1–2 sentence description shown on the listing page
   - content:  Full post in MARKDOWN format

================================================================ */

const BLOG_DATA = [

  {
    id:      'why-i-chose-cybersecurity',
    title:   'Why I Chose Cybersecurity',
    date:    'April 2026',
    tags:    ['thoughts', 'cybersecurity', 'personal'],
    summary: 'Everyone asks me why I picked cybersecurity over regular software engineering. Here\'s my honest answer — it\'s not just about the money or hype.',

    content: `
## The Real Reason

People assume I chose cybersecurity because of movies. Mr. Robot. Hackers. The whole "typing fast in a dark room" aesthetic.

That's not it.

The real reason? I broke something and had no idea how.

Back in secondary school, I was playing around with a game — trying to mod it, change some values, the usual. I accidentally triggered some kind of anti-cheat and got banned. And I just sat there staring at the screen thinking: *how did it know?*

That question sent me down a rabbit hole I never climbed out of.

## What Actually Got Me Hooked

It wasn't hacking for the sake of hacking. It was the **understanding**. Every vulnerability tells a story about how something was built — what assumption the developer made, where that assumption breaks down, and why.

When I solve a CTF challenge, I'm not just getting a flag. I'm reading a story written in code.

That's addictive in a way most things aren't.

## The Honest Part

I won't pretend cybersecurity is all exciting. A lot of it is reading documentation for hours. Running tools that return nothing. Staring at hex dumps trying to find a pattern.

But when it clicks? When you find the thing — the weird byte offset, the misconfigured header, the base64-in-base64 — there's nothing quite like it.

It's puzzle-solving with real stakes. And I think that's why I stayed.

## What I'd Tell My Past Self

Stop trying to learn everything at once. Pick one thing — forensics, web, crypto, whatever — and go deep. The breadth comes naturally after you have a foundation.

And don't be embarrassed to not know things. Everyone in this field Googles constantly.

That's all. Just wanted to write this down somewhere.
    `,
  },

  {
    id:      'my-first-ctf-experience',
    title:   'My First CTF — What I Expected vs Reality',
    date:    'March 2026',
    tags:    ['ctf', 'experience', 'beginner'],
    summary: 'I thought my first CTF would be like in the movies. It was not. But I learned more in 48 hours than in weeks of studying.',

    content: `
## What I Expected

I imagined my first CTF would go something like this:

1. Open terminal
2. Type some cool commands
3. Flag appears
4. I feel like a genius

## What Actually Happened

I spent the first three hours staring at a challenge description I didn't understand. My teammate had already solved two challenges. I opened and closed CyberChef about fifteen times.

The first flag I got was by complete accident — I ran \`strings\` on a file expecting nothing and the flag just... appeared. I screamed at my desk at 2 AM.

## What I Actually Learned

**You don't need to understand everything.** You need to know enough to try things and recognize when something is working.

**Teamwork is not optional.** Nobody is good at everything in a 48-hour CTF. My teammate crushed the crypto challenges while I handled forensics. Together we placed way better than either of us would alone.

**Write things down.** I stopped keeping notes halfway through because I was rushing. I wasted 45 minutes later re-doing recon on a challenge I had already partially solved.

**Sleep.** I pulled an all-nighter for the first time. It felt heroic at midnight. At 6 AM I was making basic mistakes on challenges I would normally solve in five minutes.

## The Part Nobody Talks About

The feeling when your team moves up the scoreboard. Even one spot.

It's disproportionately good. Like, I know it's just points on a screen, but something about competing live — against other real people who are also sleep-deprived and caffeinated and trying just as hard — makes it hit different.

I was hooked after that first one. Still am.

## If You Haven't Done a CTF Yet

[PicoCTF](https://picoctf.org) is where I started. It's beginner-friendly and the challenges stay up permanently so you can practice anytime.

Just do it. You'll feel stupid for a while and then you'll feel great. That's the whole experience.
    `,
  },

  {
    id:      'tools-i-actually-use',
    title:   'Tools I Actually Use (and Why)',
    date:    'February 2026',
    tags:    ['tools', 'forensics', 'workflow'],
    summary: 'A no-fluff list of the tools that actually end up in my CTF workflow — with honest notes on when they\'re useful and when they\'re not.',

    content: `
## Quick Disclaimer

This is not a "top 100 hacking tools" list. These are just the things I personally reach for, mostly for forensics and web challenges. Your workflow will be different.

---

## File Analysis

### \`file\` and \`strings\`

Sounds basic. I use these constantly. Before I do anything else with a mystery file, these two run first.

\`file\` tells me what something actually is (not what the extension says). \`strings\` pulls out anything human-readable, which often includes flags hiding in plain sight.

### \`binwalk\`

For extracting embedded files. If someone hid a zip inside a PNG inside a PDF, \`binwalk\` will find it.

\`\`\`bash
binwalk -e suspicious_file.png
\`\`\`

### Autopsy

For disk image / mobile forensics challenges. It's slow and heavy but there's nothing else that comes close for browsing through a full device artifact.

---

## Encoding / Decoding

### CyberChef

Honestly a cheat code. Base64, hex, XOR, Morse, ROT13 — it does everything and you can chain operations. I have it bookmarked and open at all times.

The "magic" operation (which auto-detects encoding) has saved me embarrassing amounts of time.

---

## Image / Steganography

### \`steghide\`

For extracting files hidden in JPEG/BMP files. If a challenge gives you an image and no other hints, try \`steghide extract -sf image.jpg\` with common passwords first.

### Audacity

I know, it's an audio editor. But for analyzing WAV files for steganography — especially spectrogram-based challenges — nothing beats it.

Switch to spectrogram view: **View → Spectrogram**. If text appears in the frequency domain, you've found something.

---

## Web

### Burp Suite Community

I intercept HTTP traffic with this constantly. The repeater and decoder tabs are what I use most. The pro version has an active scanner but the community edition is fine for CTFs.

### \`curl\` with \`-v\`

Sometimes you don't need a GUI. Verbose \`curl\` shows you headers, redirects, and status codes in a way that's easy to grep through.

---

## That's Actually It

I know some people have massive tool lists. Mine is short because I'd rather know five tools well than fifteen tools poorly.

The skill isn't knowing the tools exist. The skill is knowing *which* tool to reach for and *when*.
    `,
  },

];
