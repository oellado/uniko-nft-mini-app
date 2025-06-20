#!/usr/bin/env python3
"""
Unikō Font Subset Generator
Creates a minimal font subset containing only the Unicode characters used in Unikō traits.
"""

import os
import base64
from fontTools import subset
from fontTools.ttLib import TTFont

def get_uniko_characters():
    """Get all Unicode characters used in Unikō traits"""
    
    # Regular trait characters (from V7 contract analysis)
    eyes = ["•", "⚆", "⚈", "⨀", "⦿", "⤬", "◒", "◓", "◕", "∸", "-", "■", "⊡", "◨", "∩", "⬗", "⋒"]
    mouths = ["ᴗ", "⤻", "―", "﹏", "⩊", "ω", "⟀", "~", "⩌", "︿", "3", ".", "ᆺ", "ᴥ", "ʌ", "⎦"]
    cheeks = ["^", ">", "<", "–", "⬤", "~", "≈", "≋", "⁕", "∙", "∘", "="]
    accessories = ["♫", "✿", "★", "✧", "☾", "↑", "♥"]
    
    # Combine all unique characters
    all_chars = set()
    
    # Add trait characters
    for char_list in [eyes, mouths, cheeks, accessories]:
        for char in char_list:
            all_chars.update(char)
    
    # Add space character (used in trait combinations)
    all_chars.add(" ")
    
    return sorted(list(all_chars))

def create_font_subset():
    """Create a minimal font subset for Unikō"""
    
    input_font = "NotoSansSymbols2-Regular.ttf"
    output_ttf = "uniko-subset.ttf" 
    output_woff2 = "uniko-subset.woff2"
    output_base64 = "uniko-subset-base64.txt"
    
    if not os.path.exists(input_font):
        print(f"❌ Error: {input_font} not found!")
        print("Please download Noto Sans Symbols 2 from Google Fonts")
        return False
    
    # Get Unicode characters used in Unikō
    uniko_chars = get_uniko_characters()
    
    print(f"🔤 Characters to include: {len(uniko_chars)}")
    print(f"📝 Characters: {''.join(uniko_chars)}")
    
    # Create subset
    print(f"🔨 Creating subset from {input_font}...")
    
    # Load font and create subsetter
    font = TTFont(input_font)
    subsetter = subset.Subsetter()
    
    # Configure subsetter options for minimal size
    subsetter.options.retain_gids = False
    subsetter.options.notdef_outline = False
    subsetter.options.recommended_glyphs = False
    subsetter.options.name_IDs = ['*']
    subsetter.options.name_legacy = True
    subsetter.options.drop_tables = ['GSUB', 'GPOS', 'GDEF', 'kern']
    
    # Set characters to keep
    subsetter.options.text = ''.join(uniko_chars)
    
    # Subset the font 
    subsetter.subset(font)
    
    # Save TTF subset
    font.save(output_ttf)
    print(f"✅ TTF subset saved: {output_ttf}")
    
    # Convert to WOFF2 (requires additional tools)
    try:
        from fontTools.ttLib import woff2
        
        # Load TTF and save as WOFF2  
        ttf_font = TTFont(output_ttf)
        ttf_font.flavor = 'woff2'
        ttf_font.save(output_woff2)
        print(f"✅ WOFF2 subset saved: {output_woff2}")
        
        # Create base64 encoding for contract
        with open(output_woff2, 'rb') as f:
            woff2_data = f.read()
        
        base64_data = base64.b64encode(woff2_data).decode('utf-8')
        data_uri = f"data:font/woff2;base64,{base64_data}"
        
        with open(output_base64, 'w') as f:
            f.write(data_uri)
        
        print(f"✅ Base64 encoding saved: {output_base64}")
        
        # Size analysis
        original_size = os.path.getsize(input_font)
        ttf_size = os.path.getsize(output_ttf)
        woff2_size = os.path.getsize(output_woff2)
        base64_size = len(data_uri)
        
        print(f"\n📊 Size Analysis:")
        print(f"📏 Original font: {original_size:,} bytes ({original_size/1024:.1f} KB)")
        print(f"📏 TTF subset: {ttf_size:,} bytes ({ttf_size/1024:.1f} KB)")
        print(f"📏 WOFF2 subset: {woff2_size:,} bytes ({woff2_size/1024:.1f} KB)")
        print(f"📏 Base64 for contract: {base64_size:,} bytes ({base64_size/1024:.1f} KB)")
        print(f"🎯 Compression ratio: {((original_size - woff2_size) / original_size * 100):.1f}%")
        
        # Contract size analysis
        print(f"\n🔧 Contract Integration:")
        if base64_size < 4000:
            print(f"✅ Font size suitable for contract embedding")
            print(f"📊 Estimated contract increase: ~{base64_size} bytes")
        else:
            print(f"⚠️  Font size large ({base64_size} bytes) - may need further optimization")
        
        return True
        
    except ImportError:
        print("❌ WOFF2 support not available. Install with: pip install fonttools[woff]")
        return False
    except Exception as e:
        print(f"❌ Error creating WOFF2: {e}")
        return False

if __name__ == "__main__":
    print("🎨 Unikō Font Subset Generator")
    print("=" * 50)
    
    success = create_font_subset()
    
    if success:
        print("\n🎉 Font subset creation complete!")
        print("📝 Next steps:")
        print("1. Check the generated files")
        print("2. Copy base64 data to contract")
        print("3. Update SVG font-family references")
        print("4. Test contract size under 24KB")
    else:
        print("\n❌ Font subset creation failed!") 