path = 'SYSTEM_DOC.md'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
old = '> **Last Updated:** 2026-10-26 (Hermes 審計 #1 deploy + doc fix)\n> **Deployed Version:** `0efa118e-85d1-43eb-bf43-c2a939da1927`'
new = '> **Last Updated:** 2026-10-26 (Hermes 審計 #2 deploy: origin tier annotation + v1.17 schema)\n> **Deployed Version:** `f7794e5f-a4a7-463a-8e29-57ce26a8cd42`'
assert old in content, f'old not found\nold={repr(old)}\nnew={repr(new)}'
content = content.replace(old, new)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('done')
