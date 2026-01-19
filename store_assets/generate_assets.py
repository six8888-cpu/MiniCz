#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.dirname(BASE_DIR) + '/assets'

# 颜色配置
BG_GRADIENT_START = (26, 26, 46)  # #1a1a2e
BG_GRADIENT_END = (22, 33, 62)    # #16213e
GOLD = (255, 215, 0)
WHITE = (255, 255, 255)
RED = (231, 76, 60)

def create_gradient(width, height):
    """创建渐变背景"""
    img = Image.new('RGB', (width, height))
    for y in range(height):
        r = int(BG_GRADIENT_START[0] + (BG_GRADIENT_END[0] - BG_GRADIENT_START[0]) * y / height)
        g = int(BG_GRADIENT_START[1] + (BG_GRADIENT_END[1] - BG_GRADIENT_START[1]) * y / height)
        b = int(BG_GRADIENT_START[2] + (BG_GRADIENT_END[2] - BG_GRADIENT_START[2]) * y / height)
        for x in range(width):
            img.putpixel((x, y), (r, g, b))
    return img

def add_text(draw, text, pos, size, color, bold=False):
    """添加文字（使用默认字体）"""
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except:
        font = ImageFont.load_default()
    draw.text(pos, text, fill=color, font=font)

def create_store_icon():
    """创建商店图标 128x128"""
    img = create_gradient(128, 128)
    draw = ImageDraw.Draw(img)
    
    # 绘制卦象符号
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 60)
    except:
        font = ImageFont.load_default()
    
    # 卦象符号 ☰ (乾卦)
    text = "☰"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (128 - text_width) // 2
    y = (128 - text_height) // 2 - 10
    draw.text((x, y), text, fill=GOLD, font=font)
    
    img.save(os.path.join(BASE_DIR, 'store_icon_128.png'))
    print("Created: store_icon_128.png")

def create_promo_small():
    """创建小宣传图 440x280"""
    img = create_gradient(440, 280)
    draw = ImageDraw.Draw(img)
    
    # 加载宠物图片
    try:
        pet = Image.open(os.path.join(ASSETS_DIR, 'pet.png')).convert('RGBA')
        pet = pet.resize((120, 120), Image.LANCZOS)
        # 放置在左侧
        img.paste(pet, (30, 80), pet)
    except Exception as e:
        print(f"Warning: Could not load pet.png: {e}")
    
    # 标题
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
        font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
    
    # 卦象符号
    draw.text((180, 60), "☰", fill=GOLD, font=font_title)
    
    # 中文标题（用英文替代，因为没有中文字体）
    draw.text((220, 55), "Divination Pet", fill=WHITE, font=font_title)
    
    # 副标题
    draw.text((180, 120), "I-Ching Fortune Telling", fill=(200, 200, 200), font=font_sub)
    draw.text((180, 150), "Click the pet to divine your luck!", fill=(150, 150, 150), font=font_sub)
    
    # 吉凶标签
    draw.rounded_rectangle([180, 190, 220, 220], radius=5, fill=RED)
    draw.text((188, 193), "JI", fill=WHITE, font=font_sub)
    
    draw.rounded_rectangle([230, 190, 290, 220], radius=5, fill=(243, 156, 18))
    draw.text((238, 193), "MID", fill=WHITE, font=font_sub)
    
    draw.rounded_rectangle([300, 190, 360, 220], radius=5, fill=(39, 174, 96))
    draw.text((308, 193), "BAD", fill=WHITE, font=font_sub)
    
    img.save(os.path.join(BASE_DIR, 'promo_small_440x280.png'))
    print("Created: promo_small_440x280.png")

def create_promo_large():
    """创建大宣传图 1400x560"""
    img = create_gradient(1400, 560)
    draw = ImageDraw.Draw(img)
    
    # 加载宠物图片
    try:
        pet = Image.open(os.path.join(ASSETS_DIR, 'pet.png')).convert('RGBA')
        pet = pet.resize((280, 280), Image.LANCZOS)
        img.paste(pet, (100, 140), pet)
    except Exception as e:
        print(f"Warning: Could not load pet.png: {e}")
    
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
        font_hexagram = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 120)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_hexagram = ImageFont.load_default()
    
    # 卦象装饰
    draw.text((450, 120), "☰", fill=GOLD, font=font_hexagram)
    
    # 标题
    draw.text((600, 150), "Divination Pet", fill=WHITE, font=font_title)
    
    # 副标题
    draw.text((600, 250), "Ancient I-Ching Fortune Telling", fill=(200, 200, 200), font=font_sub)
    draw.text((600, 300), "64 Hexagrams | Voice Feedback | Desktop Pet", fill=(150, 150, 150), font=font_sub)
    
    # 功能标签
    tags = ["Click to Divine", "6 Animations", "30+ Voice Lines", "3D Effect"]
    x_start = 600
    for i, tag in enumerate(tags):
        x = x_start + i * 180
        draw.rounded_rectangle([x, 380, x + 160, 420], radius=10, fill=(50, 50, 80))
        draw.text((x + 10, 388), tag, fill=GOLD, font=ImageFont.load_default())
    
    img.save(os.path.join(BASE_DIR, 'promo_large_1400x560.png'))
    print("Created: promo_large_1400x560.png")

def create_screenshot():
    """创建截图 1280x800"""
    # 模拟浏览器界面
    img = Image.new('RGB', (1280, 800), (40, 40, 40))
    draw = ImageDraw.Draw(img)
    
    # 浏览器标题栏
    draw.rectangle([0, 0, 1280, 60], fill=(60, 60, 60))
    
    # 地址栏
    draw.rounded_rectangle([200, 15, 1000, 45], radius=15, fill=(80, 80, 80))
    draw.text((220, 22), "https://example.com", fill=(150, 150, 150))
    
    # 模拟网页内容区域
    draw.rectangle([0, 60, 1280, 800], fill=(245, 245, 245))
    
    # 模拟网页内容
    draw.rectangle([50, 100, 900, 150], fill=(220, 220, 220))
    draw.rectangle([50, 170, 700, 200], fill=(230, 230, 230))
    draw.rectangle([50, 220, 800, 250], fill=(230, 230, 230))
    draw.rectangle([50, 270, 600, 300], fill=(230, 230, 230))
    
    # 宠物位置（右下角）
    pet_bg = create_gradient(140, 180)
    img.paste(pet_bg, (1100, 580))
    
    # 加载宠物图片
    try:
        pet = Image.open(os.path.join(ASSETS_DIR, 'pet.png')).convert('RGBA')
        pet = pet.resize((100, 100), Image.LANCZOS)
        img.paste(pet, (1120, 620), pet)
    except:
        pass
    
    # 占卜结果弹窗
    popup_x, popup_y = 980, 350
    draw.rounded_rectangle([popup_x, popup_y, popup_x + 280, popup_y + 220], radius=16, fill=(26, 26, 46))
    
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 48)
        font_name = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
        font_desc = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except:
        font = ImageFont.load_default()
        font_name = ImageFont.load_default()
        font_desc = ImageFont.load_default()
    
    # 卦象符号
    draw.text((popup_x + 110, popup_y + 20), "☰", fill=GOLD, font=font)
    
    # 卦名
    draw.text((popup_x + 90, popup_y + 90), "Qian Gua", fill=WHITE, font=font_name)
    
    # 吉凶标签
    draw.rounded_rectangle([popup_x + 110, popup_y + 130, popup_x + 170, popup_y + 160], radius=10, fill=RED)
    draw.text((popup_x + 130, popup_y + 135), "JI", fill=WHITE, font=font_desc)
    
    # 描述
    draw.text((popup_x + 40, popup_y + 180), "Great fortune and prosperity", fill=(200, 200, 200), font=font_desc)
    
    img.save(os.path.join(BASE_DIR, 'screenshot_1280x800.png'))
    print("Created: screenshot_1280x800.png")

def create_screenshot_640():
    """创建小截图 640x400"""
    # 先创建1280x800，再缩小
    img = Image.open(os.path.join(BASE_DIR, 'screenshot_1280x800.png'))
    img = img.resize((640, 400), Image.LANCZOS)
    img.save(os.path.join(BASE_DIR, 'screenshot_640x400.png'))
    print("Created: screenshot_640x400.png")

if __name__ == '__main__':
    print("Generating Chrome Web Store assets...")
    create_store_icon()
    create_promo_small()
    create_promo_large()
    create_screenshot()
    create_screenshot_640()
    print("\nAll assets generated!")
