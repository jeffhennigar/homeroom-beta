import sys
import re

def check_html_js(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract scripts with type="text/babel"
    scripts = re.findall(r'<script type="text/babel".*?>(.*?)</script>', content, re.DOTALL)
    
    for i, script in enumerate(scripts):
        print(f"Checking Script {i}...")
        try:
            # We can't use compile() directly because of JSX, but we can check basic JS syntax 
            # by removing JSX or just looking for unclosed braces.
            # However, for a quick check, let's just count braces.
            open_braces = script.count('{')
            close_braces = script.count('}')
            print(f"  Open braces: {open_braces}, Close braces: {close_braces}")
            if open_braces != close_braces:
                print(f"  WARNING: Brace mismatch in Script {i}!")
            
            open_parens = script.count('(')
            close_parens = script.count(')')
            print(f"  Open parens: {open_parens}, Close parens: {close_parens}")
            if open_parens != close_parens:
                print(f"  WARNING: Parentheses mismatch in Script {i}!")
                
        except Exception as e:
            print(f"  Error checking script: {e}")

if __name__ == "__main__":
    check_html_js(sys.argv[1])
