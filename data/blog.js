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
    id:      'building-bad-usb',
    title:   'Building a Bad USB — What a $5 Pico Taught Me About HID Attacks',
    date:    'July 2026',
    tags:    ['security', 'hardware', 'project'],
    summary: 'A Raspberry Pi Pico running CircuitPython that enumerates as a USB HID keyboard and runs a DuckyScript payload — a full breakdown of the boot-time USB toggle, the payload parser, the key map, and the GP0 arming logic.',

    content: `

A "Bad USB" is a device that looks like a flash drive but tells the host it's a **keyboard**. Operating systems trust HID keyboards implicitly — no drivers, no prompts — so once enumerated it can inject keystrokes faster than any human. I built one on a **Raspberry Pi Pico** to understand that trust boundary from the inside. This is a walk through how the firmware actually works.

> The host never authenticates a keyboard. It authenticates *nothing* — a keyboard is just a USB device that claims the HID keyboard descriptor.

## Bill of materials

- **Raspberry Pi Pico** (RP2040)
- A **data** USB cable (charge-only cables won't enumerate)
- An optional jumper wire on **GP0** for mode switching

The Pico runs **CircuitPython**, which exposes USB HID through the \`adafruit_hid\` library. No Arduino, no C — the whole thing is Python on the microcontroller.

## Repo layout

\`\`\`
boot.py                  # runs first; decides USB drive visibility
boot_SILENT_DEPLOY.py    # alt boot: always hidden for deployment
code.py                  # the payload interpreter
payload.dd               # the DuckyScript to execute
lib/adafruit_hid/        # HID keyboard + keycode library
\`\`\`

CircuitPython runs \`boot.py\` once at power-on (before USB is fully exposed), then hands off to \`code.py\`.

## Step 1 — hide the drive at boot

The clever part is that whether the host sees a removable drive is decided in \`boot.py\`, because \`storage.disable_usb_drive()\` only works during boot. A jumper on GP0 selects the mode:

\`\`\`python
import board, digitalio, storage

jmp = digitalio.DigitalInOut(board.GP0)
jmp.switch_to_input(pull=digitalio.Pull.UP)
hide = jmp.value is False        # False == GP0 tied to GND
jmp.deinit()                     # release GP0 so code.py can reuse it

if hide:
    storage.disable_usb_drive()  # host sees NO removable drive -> no popup
    print("Deploy mode: USB drive hidden")
else:
    print("Edit mode: USB drive enabled")
\`\`\`

- **No jumper** → GP0 floats high via the internal pull-up → drive is visible → I can edit \`payload.dd\`.
- **GP0 → GND** → reads low → drive is hidden → on a target there's no "removable disk" popup to give it away.

\`deinit()\` matters: it frees GP0 so the payload interpreter can read the same pin again as an arming switch.

## Step 2 — parse the payload

\`code.py\` reads \`payload.dd\` line by line, strips whitespace, skips blanks, and splits each line into a command plus its argument. The dialect is a trimmed-down **DuckyScript**:

| Command | Effect |
|---|---|
| \`REM ...\` | comment, ignored |
| \`DELAY ms\` | sleep for \`ms\` milliseconds |
| \`DEFAULT_DELAY ms\` | delay inserted after *every* command |
| \`STRING text\` | type literal text |
| \`STRINGLN text\` | type text, then press Enter |
| \`GUI r\` / \`CTRL ALT DELETE\` | chord — keys pressed simultaneously |
| \`REPEAT n\` | re-run the previous line \`n\` times |

Anything that isn't a keyword is treated as a chord and looked up token-by-token in a \`KEYS\` dictionary (~40 entries) that maps DuckyScript names to CircuitPython \`Keycode\` constants — \`GUI\`, \`CTRL\`, \`ALT\`, \`SHIFT\`, arrows, and \`F1\`–\`F12\`. Because modifiers and the final key are pressed together and then released, \`GUI r\` opens the Run dialog exactly like a human holding Win and tapping R.

A minimal payload looks like this:

\`\`\`
REM Demo: open Notepad and type a message
DELAY 1500
GUI r
DELAY 600
STRING notepad
ENTER
DELAY 1200
STRINGLN Hello from my Raspberry Pi Pico rubber ducky!
STRING It works.
\`\`\`

Keeping the payload as **data** rather than firmware means changing behaviour is a text edit and a replug — no reflash.

## Step 3 — arming and status feedback

To avoid the device firing the instant it's powered for editing, \`code.py\` has a \`REQUIRE_JUMPER\` flag. When it's \`True\`, it re-reads GP0 (with pull-up): floating-high = **safe**, tied to GND = **armed**. The on-board LED reports state:

- **Armed:** three quick blinks as the payload starts, then solid-on when it finishes.
- **Safe:** a slow ~0.5 s heartbeat blink; the payload never runs.

With the default (\`False\`) it simply runs once on power-up. It's a small state machine, but it's the difference between a tool and an accident.

## What it actually taught me

- **Physical access is its own threat model.** People harden the network and forget the two seconds a stranger has at an unlocked machine.
- **Speed defeats supervision.** The payload types and hits Enter faster than you can read the first token — "I'll just watch it" isn't a control.
- **Defenses are boring on purpose.** Lock the screen; don't plug in unknown devices; on managed fleets, USB device-control policy (Group Policy / USBGuard) and EDR that flags a storage device suddenly enumerating as a keyboard shut most of this down.

## Responsible use

This is built for **education and authorized testing only** — on hardware you own or have explicit permission to test. Understanding how HID injection works is the first step to defending against it; using it against someone else's machine is on you, not the tool.

Full source, the complete \`KEYS\` map, and setup steps are on [GitHub](https://github.com/ZakhwanAnuar/Bad-USB).
    `,
  },

  {
    id:      'csm-cyberjaya-visit',
    title:   'A Visit to CyberSecurity Malaysia — My Last Event Leading MBOT',
    date:    'July 2026',
    tags:    ['personal', 'leadership', 'cybersecurity'],
    summary: 'My final event leading the MBOT UNITEN Student Chapter — a visit to CyberSecurity Malaysia in Cyberjaya, and a reflection on growth, leadership, and becoming someone new.',

    content: `

![CSM Visit](assets/images/Blog/csm.jpg)

> "You pernah nampak tak orang tu, orang yang sama je lepas 3 tahun tak jumpa?"

That was a conversation I had with an old friend about a year ago. She is a very good friend. We were talking about personal growth, and we agreed on one thing — if a person doesn't change or learn something new every 6 months, they're just stuck.

## A Year Ago, That Was Almost Me

A year ago, that was almost me. I was just a normal student at UNITEN. Go to class, play sports in the evening, hangout with friends at night. It was a comfortable routine.

But now felt different. Throughout the years, I have been rebuilding myself. This event was the final event I led with my club, MBOT UNITEN Student Chapter — a visit to CyberSecurity Malaysia (CSM).

## Standing There in Cyberjaya

Standing there in Cyberjaya, looking at the team and the participants, that conversation from a year ago hit me. Leading this wasn't easy, and it forced me completely out of my comfort zone. It made me change.

But I realized something important along the way: When you are not a leader, success is about yourself. When you become a leader, success is about growing others to their fullness.

## What Leading Is Actually About

Throughout running this program, my only real hope was that everyone who joined walked away with something. I hope everyone learned something new about cybersecurity, or at the very least, just had a good time and created happy memories with their friends. To me, that's what leading is actually about. It's not about the title — it's about making sure the people around you are leveling up and enjoying the journey together.

Cybersecurity moves fast. If we don't keep learning, we get left behind. Seeing everyone engage and ask questions to the experts at CSM made all the stress of putting this together worth it.

## Not the End

This might be my last event leading the club, but it's definitely not the end of my journey in UNITEN Cybersecurity Community. Big thanks to the committee who stuck by me for this event — Afrina Johar, Fathiah Hulwani, Iqbal Zaim, Izz Ryan, Hanis Hannani Mohd Yusoff, 'Imran Zaqwan, Nurin Aiman, Yusriena and Iman Madihah — and to CyberSecurity Malaysia for having us.

I'm definitely not the same person I was a year ago. Alhamdulillah.

---

Also… my weight increased throughout the years 😅. Since I'm off the club, let's start building this again. Give me 6 months to lose weight. Or at least before grad...
    `,
  },

  {
    id:      'cybershield-summit-2026',
    title:   'Speaking at CyberShield Summit 2026',
    date:    'July 2026',
    tags:    ['speaking', 'cybersecurity', 'ctf'],
    summary: 'How one simple conversation led to speaking at a national-level cybersecurity summit — sharing CTF, cybersecurity, and the Malaysia Board of Technologists with 360+ students across the country.',

    content: `

![CyberShield Summit 2026](assets/images/Blog/cybershield.jpg)

I had the privilege of speaking at **CyberShield Summit 2026**, a national-level cybersecurity event organized by Persatuan Teknologi Maklumat UPSI, Universiti Pendidikan Sultan Idris, Universiti Malaysia Kelantan, and Universiti Utara Malaysia, with co-organization by MBOT UNITEN Student Chapter.

## How It Started

This opportunity started earlier this year when I met Encik Muhammad Hakimi Mastor from Bright Scholar Academy at an event in Universiti Pendidikan Sultan Idris. We had a simple conversation about the Malaysia Board of Technologists, technology, education, cybersecurity, Capture The Flag (CTF), and student involvement in the field. From that discussion, he later recommended me to his juniors at UPSI, which eventually led to an invitation to speak at this program.

## The Session

On the day of the session, I had the chance to share my experiences in cybersecurity and CTF competitions with more than 360+ participants from across the country. It was a meaningful experience to connect with students who are genuinely interested in exploring cybersecurity, regardless of their background or level of experience.

I also took the opportunity to introduce and explain what the Malaysia Board of Technologists is, along with its role in developing and supporting Malaysia's technical talent ecosystem. Many participants were not familiar with the Malaysia Board of Technologists before the session, so it was good to share how it contributes to professional recognition and growth in technical fields.

## CTF Is the First Step

One of the key points I focused on during the talk was that CTF is often the first step into cybersecurity. It is one of the most practical ways to get exposure to real-world cybersecurity thinking, where learners can develop problem-solving skills, technical understanding, and a hands-on mindset.

## The Engagement

What I appreciated most was the engagement from the participants. There were many thoughtful questions throughout the session, and most participants stayed until the very end. That level of curiosity and commitment made the session even more meaningful.

I'm sincerely thankful to Persatuan Teknologi Maklumat UPSI and the organizing team for the opportunity, trust, and support throughout this journey.

---

One conversation can open different opportunities.
    `,
  },

  {
    id:      'mbot-coderush-2026',
    title:   'MBOT CodeRush 2026 — An Experiment in Letting Go',
    date:    'April 2026',
    tags:    ['personal', 'leadership', 'life'],
    summary: 'No code, no competition results. Just a reflection on stepping back, trusting others, and discovering that the best leadership sometimes means giving others the space to lead.',

    content: `

The "Experiment".

 ![Question](assets/images/Blog/coderush.JPG)
---

## The Quote That Started It All

> "Before you are a leader, success is about growing yourself. When you become a leader, success is about growing others."

MBOT CodeRush 2026 was my experiment.

An experiment in letting go, trusting others, and opening opportunities.

## Stepping Back

This year, I stepped back from being Program Director and took on the role of VPD — so my junior could lead this event.

It wasn't easy.

There were moments I wanted to step in, fix things, and take control.

But this time, I practiced what I've been learning.

Not to micromanage. To delegate properly. To trust my team.

## When It All Came Together

Alhamdulillah, this turned out to be one of the smoothest events I've been part of.

One of my favorite moments was during our postmortem. Hearing everyone share that they learned something new from organizing this event really meant a lot to me.

That's when I knew — *this experiment worked.*

## What CodeRush Became

As a leader, we open opportunities for others. We give them the space to try, to make mistakes, and to grow.

CodeRush may be a coding competition, but for me, it became something more.

It became a place where people grow into who they are meant to be.

## Thank You

Thank you to all committee members involved. None of this would have been possible without your effort, patience, and commitment.

---

Still learning. But this experience reminded me that sometimes the best leadership is choosing to step back — so others can step up.

I hope I can continue to contribute and create more opportunities like this in the future.

Alhamdulillah.
    `,
  },

  {
    id:      'scholarship-journey',
    title:   'Scholarship Journey — From Rejections to Peace',
    date:    'April 2026',
    tags:    ['personal', 'scholarship', 'life'],
    summary: 'No CTF, no cybersecurity. Just an email that brought me back to one of the hardest chapters of my life — rejections, pressure, guilt, and eventually, peace.',

    content: `
Today's post is a bit different. No CTF, no cybersecurity. It's a bit long, but I'd really appreciate it if you could read through the whole thing.
 ![Question](assets/images/Blog/scholarship.jpg)
This is about my scholarship journey.

---

## The Email

This email brought me back to a chapter of my life that I will never forget.

Reading it again made me pause. It reminded me of a time when everything felt uncertain, heavy, and overwhelming.

## The Choice I Made

After SPM, I was offered a scholarship in the medical/engineering field. It was a good opportunity, but deep down I knew it wasn't my path.

I chose to reject it and pursue Computer Science instead — because it's my dream.

I accepted a scholarship for Foundation in Computer Science at UNITEN, even though it felt like stepping into the unknown.

## When Things Changed

For my foundation, things were stable. I did well. But when I moved on to degree, everything changed.

The scholarship only covered my foundation, and I had to face how expensive the fees at UNITEN were. That was when the pressure started. Every semester came with the same question — *how am I going to get through this?*

I started applying for scholarships again.

## The MARA Rejection

One of the moments I will never forget was my MARA application. I worked hard and truly believed I had a strong chance, especially with my foundation results. I allowed myself to feel hopeful.

But in the end, I was rejected.

Not because I was not good enough — but because of a small mistake. I submitted the wrong document.

That silence after trying to appeal was painful. It felt like all my effort disappeared just like that.

## Rejection After Rejection

After that, I kept going. I applied again and again. Some ended early, some reached the final stage — but the result was still the same.

Rejection.

During that time, my parents supported me financially, even when I knew it was not easy for them. That stayed with me the most.

I felt the pressure.

I felt the guilt.

I felt like I was becoming a burden.

But I kept going.

## And Then Everything Changed

Receiving the **Dato' Low Tuck Kwong Foundation Scholarship** gave me something I needed the most — peace of mind. It allowed me to finally breathe and focus again.

During my intake, only three candidates were selected. That made it even more meaningful, and reminded me how rare this opportunity is.

## What This Email Reminded Me

This email reminded me of everything. The risks, the rejections, the mistakes, and the people who stood by me.

Thank you to those who gave me emotional support during that time — especially the one who stayed when things were at my lowest. You know who you are. We were going through the same struggles, and we kept each other going. Looking back, I wish I had managed my stress better. I didn't… and things fell apart. But still — thank you.

---

This journey was not easy, but it shaped me a lot.

I will never forget this.

*Alhamdulillah.*
    `,
  },

  {
    id:      'micromanagement-trap-leadership',
    title:   'The Micromanagement Trap in Leadership',
    date:    'April 2026',
    tags:    ['leadership', 'thoughts', 'seasel25'],
    summary: 'A reflection from my conversation with a colleague at Southeast Asia Sustainable Environmental Leadership Program 2025 (SEASEL\'25) on why micromanaging erodes trust — and what it really means to lead with confidence instead of control.',

    content: `

![Question](assets/images/Blog/seasel.jpg)
    ## A Lesson From a Conversation

One of my most valuable leadership lessons at SEASEL'25 didn't come from a keynote or a panel session — it came from a simple conversation with a colleague.

We found ourselves reflecting on a common pattern among young leaders: the tendency to micromanage or come across as overly bossy. At first glance, both behaviors can feel justified. Micromanaging creates a sense of control — an illusion of safety. Being bossy can feel like confidence — an illusion of strength.

But the reality is far less flattering.

Both approaches slowly erode the very foundation that leadership is built on: **trust**.

That realization stayed with me.

## What Leadership Actually Is

Leadership is not about controlling every detail or ensuring everything goes exactly your way. It's about creating an environment where people feel empowered to take ownership, contribute meaningfully, and grow alongside you.

Instead of tightening control, effective leaders learn to let go — strategically and intentionally.

- **Micromanage less, guide more.**
- **Command less, listen more.**
- **Interfere less, trust more.**

It sounds simple, but it requires a shift in mindset.

Because here's the truth: **When you trust people, they rise. When you control them, they shrink.**

## What I Saw at SEASEL'25

Throughout SEASEL'25, I saw this principle play out repeatedly. The most successful teams weren't driven by authority or rigid control — they thrived on mutual trust, collaboration, and shared ownership.

That's when it became clear to me:

> Leadership is not measured by how tightly you hold control, but by how confidently others can move when you let go.

## Carrying It Forward

This reflection was sparked by an insightful thought shared by Yasin Shahrozaini — a reminder that sometimes the most impactful lessons come from conversations, not stages.

As I continue growing in my leadership journey, this is something I'll carry forward: Not just leading people, but trusting them enough to lead *with* me.
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
