import json, sys

content_path = sys.argv[1] if len(sys.argv)>1 else 'dist/content.json'
with open(content_path, 'r', encoding='utf-8') as f:
    d = json.load(f)

posts = d['posts']
published_count = sum(1 for p in posts if p.get('published') is not False)
total_count = len(posts)
print(f"Published: {published_count}, Total: {total_count}")
