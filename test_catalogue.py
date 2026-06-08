from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    print("Navigating to catalogue...")
    page.goto('http://localhost:3000/catalogue')
    page.wait_for_load_state('networkidle')
    
    print("Taking screenshot...")
    screenshot_path = os.path.join(os.getcwd(), 'catalogue_test.png')
    page.screenshot(path=screenshot_path, full_page=True)
    
    print("Checking if images are loaded successfully...")
    images = page.locator('img').all()
    for img in images:
        src = img.get_attribute('src')
        is_broken = page.evaluate('(img) => img.naturalWidth === 0', img.element_handle())
        print(f"Image {src}: {'BROKEN' if is_broken else 'LOADED'}")
        
    browser.close()
