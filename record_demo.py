import os
import io
import json
import time
import asyncio
import numpy as np
from PIL import Image
import imageio_ffmpeg

from playwright.async_api import async_playwright

OUTPUT_MP4 = r'd:\DealFlow\DealFlow360\full_project_demo.mp4'
WIDTH = 1280
HEIGHT = 720
FPS = 10  # 10 frames per second for smooth video rendering

# Helper to inject caption bar in DOM
INJECT_JS = """
window.updateDemoCaption = function(title, subtitle) {
  let el = document.getElementById('demo-caption-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'demo-caption-overlay';
    el.style.position = 'fixed';
    el.style.bottom = '0';
    el.style.left = '0';
    el.style.width = '100%';
    el.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
    el.style.backdropFilter = 'blur(12px)';
    el.style.borderTop = '3px solid #3b82f6';
    el.style.color = '#ffffff';
    el.style.padding = '14px 28px';
    el.style.fontSize = '14px';
    el.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    el.style.zIndex = '99999999';
    el.style.boxShadow = '0 -8px 32px rgba(0,0,0,0.7)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'space-between';
    el.style.boxSizing = 'border-box';
    el.style.transition = 'all 0.3s ease';
    document.body.appendChild(el);
  }
  el.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="background:linear-gradient(135deg, #2563eb, #3b82f6); color:#fff; font-size:11px; font-weight:800; padding:4px 10px; border-radius:4px; letter-spacing:0.8px; text-transform:uppercase; box-shadow:0 2px 6px rgba(37,99,235,0.4);">DEALFLOW360</span>
      <span style="color:#f8fafc; font-size:15px; font-weight:700;">${title}</span>
    </div>
    <div style="color:#cbd5e1; font-size:13px; font-weight:500; text-align:right; max-width:60%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${subtitle}</div>
  `;
};
"""

async def run():
    print("Starting Playwright video generator...")
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    writer = imageio_ffmpeg.write_frames(
        OUTPUT_MP4,
        (WIDTH, HEIGHT),
        fps=FPS,
        codec='libx264',
        pix_fmt_in='rgb24',
        quality=7
    )
    writer.send(None) # initialize writer generator

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': WIDTH, 'height': HEIGHT})
        page = await context.new_page()

        async def capture_seconds(seconds, title, subtitle):
            print(f"Capturing [{seconds}s]: {title} - {subtitle}")
            try:
                await page.evaluate(f"window.updateDemoCaption && window.updateDemoCaption({json.dumps(title)}, {json.dumps(subtitle)})")
            except Exception as e:
                pass

            num_frames = int(seconds * FPS)
            for _ in range(num_frames):
                png_bytes = await page.screenshot(type='png')
                img = Image.open(io.BytesIO(png_bytes)).convert('RGB')
                if img.size != (WIDTH, HEIGHT):
                    img = img.resize((WIDTH, HEIGHT))
                frame = np.array(img)
                writer.send(frame)
                await asyncio.sleep(1 / FPS)

        # ----------------------------------------------------
        # TOUR STEP 1: LOGIN (15s)
        # ----------------------------------------------------
        await page.goto("http://localhost:3000/login")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(4, "1. Authentication & Access Control", "Logging into DealFlow360 Enterprise Sales Portal")

        # Type credentials smoothly
        await page.fill('#login-identifier, input[name="identifier"]', 'om@gmail.com')
        await capture_seconds(3, "1. Authentication & Access Control", "Entering user credentials (Sales Rep / Admin)")
        
        await page.fill('#login-password, input[name="password"]:not([style*="display: none"])', 'password123')
        await capture_seconds(3, "1. Authentication & Access Control", "Encrypted JWT password authentication")
        
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(5, "1. Authentication & Access Control", "Authenticated successfully! Redirecting to Sales Dashboard...")

        # ----------------------------------------------------
        # TOUR STEP 2: DASHBOARD (20s)
        # ----------------------------------------------------
        await page.goto("http://localhost:3000/sales/dashboard")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(6, "2. Executive Sales Dashboard", "Real-time revenue metrics, win rates & active quotation KPIs")

        # Scroll down dashboard
        await page.evaluate("window.scrollBy(0, 300)")
        await capture_seconds(7, "2. Executive Sales Dashboard", "Context provided earlier: Live pipeline cards & approval alert counters")

        await page.evaluate("window.scrollBy(0, 400)")
        await capture_seconds(7, "2. Executive Sales Dashboard", "Context provided earlier: Recent activity log & quick action modules")

        # ----------------------------------------------------
        # TOUR STEP 3: QUOTATIONS LIST & PIPELINE (25s)
        # ----------------------------------------------------
        await page.goto("http://localhost:3000/sales/quotations")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(8, "3. Quotations Management & Pipeline", "Full listing of quotes with status filters (Draft, Under Review, Approved, Rejected)")

        await page.evaluate("window.scrollBy(0, 350)")
        await capture_seconds(8, "3. Quotations Management & Pipeline", "Context provided earlier: Tiered pricing calculations & multi-currency support")

        await page.evaluate("window.scrollTo(0, 0)")
        await capture_seconds(9, "3. Quotations Management & Pipeline", "Navigating to Quotation Builder to create new quote...")

        # ----------------------------------------------------
        # TOUR STEP 4: QUOTATION DETAIL Q-1042 (25s)
        # ----------------------------------------------------
        await page.goto("http://localhost:3000/sales/quotations/Q-1042")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(8, "4. Quotation Detail — Q-1042", "Context provided earlier: Complete line-item breakdown & margin validation")

        await page.evaluate("window.scrollBy(0, 300)")
        await capture_seconds(8, "4. Quotation Detail — Q-1042", "Context provided earlier: Approval workflow history & required role signatures")

        await page.evaluate("window.scrollBy(0, 400)")
        await capture_seconds(9, "4. Quotation Detail — Q-1042", "Customer billing & shipping addresses, payment terms (Net 30)")

        # ----------------------------------------------------
        # TOUR STEP 5: APPROVALS & APPROVAL DETAIL (20s)
        # ----------------------------------------------------
        await page.goto("http://localhost:3000/sales/approvals")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(6, "5. Approvals Engine & Risk Audits", "Pending & processed approval requests across all discount tiers")

        await page.goto("http://localhost:3000/sales/approvals/APP-1042")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(7, "5. Approval Detail — APP-1042", "Context provided earlier: Detailed audit log, margin risk score, and action controls")

        await page.evaluate("window.scrollBy(0, 350)")
        await capture_seconds(7, "5. Approval Detail — APP-1042", "Reviewing approval sign-off status and role thresholds")

        # ----------------------------------------------------
        # TOUR STEP 6: FULFILLMENT & BACKORDERS (20s)
        # ----------------------------------------------------
        await page.goto("http://localhost:3000/sales/fulfillment")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(10, "6. Fulfillment & Backorders Center", "Order dispatch queue, stock allocation status, and backorder tracking")

        await page.goto("http://localhost:3000/sales/fulfillment/FUL-1001")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(10, "6. Fulfillment Detail — FUL-1001", "Context provided earlier: Carrier tracking, warehouse origin & dispatch list")

        # ----------------------------------------------------
        # TOUR STEP 7: INVOICES LIST (SCREEN 12) (25s)
        # ----------------------------------------------------
        await page.goto("http://localhost:3000/sales/invoices")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(8, "7. Unified Invoices Ledger (Screen 12)", "Unified single entity ledger for One-Time, Recurring, and Mixed invoices")

        await page.evaluate("window.scrollBy(0, 350)")
        await capture_seconds(9, "7. Unified Invoices Ledger (Screen 12)", "Context provided earlier: Top KPI cards (Total, Unpaid, Fully Paid, Overdue)")

        await page.evaluate("window.scrollBy(0, 350)")
        await capture_seconds(8, "7. Unified Invoices Ledger (Screen 12)", "Multi-status pill filters & search query controls")

        # ----------------------------------------------------
        # TOUR STEP 8: INVOICE DETAIL INV-1001 (25s)
        # ----------------------------------------------------
        await page.goto("http://localhost:3000/sales/invoices/INV-1001")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(8, "8. Invoice Detail — INV-1001", "Context provided earlier: 4-Stage Horizontal Lifecycle (Confirmed -> Shipped -> Invoiced -> Paid)")

        await page.evaluate("window.scrollBy(0, 350)")
        await capture_seconds(9, "8. Invoice Detail — INV-1001", "Context provided earlier: Line item breakdown, taxes & side financial summary")

        await page.evaluate("window.scrollBy(0, 350)")
        await capture_seconds(8, "8. Invoice Detail — INV-1001", "Payment history audit log & Record Payment CTA button")

        # ----------------------------------------------------
        # TOUR STEP 9: SUBSCRIPTIONS MANAGEMENT (20s)
        # ----------------------------------------------------
        await page.goto("http://localhost:3000/sales/subscriptions")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(10, "9. Subscriptions & Billing Module", "Active customer contracts, recurring plans, billing cycles, and MRR metrics")

        await page.evaluate("window.scrollBy(0, 350)")
        await capture_seconds(10, "9. Subscriptions & Billing Module", "Context provided earlier: Automated renewal schedules & plan upgrades")

        # ----------------------------------------------------
        # TOUR STEP 10: DEAL HEALTH & RISK INTELLIGENCE (20s)
        # ----------------------------------------------------
        await page.goto("http://localhost:3000/sales/deal-health")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(10, "10. Deal Health & Risk Intelligence", "AI-driven deal health scores, margin risk warnings, and system alerts")

        await page.goto("http://localhost:3000/sales/deal-health/DH-1001")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(10, "10. Deal Health Detail — DH-1001", "Context provided earlier: Risk breakdown score & recommended mitigations")

        # ----------------------------------------------------
        # TOUR STEP 11: PRODUCTS & PRODUCT DETAIL (15s)
        # ----------------------------------------------------
        await page.goto("http://localhost:3000/sales/products")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(7, "11. Product Catalog & Inventory", "Comprehensive product list, category mapping, and price tiers")

        await page.goto("http://localhost:3000/sales/products/SKU-SYS-001")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(8, "11. Product Detail — SKU-SYS-001", "Context provided earlier: Stock levels, tier price matrix, and specifications")

        # ----------------------------------------------------
        # TOUR STEP 12: CUSTOMER PORTAL VIEW (25s)
        # ----------------------------------------------------
        await page.goto("http://localhost:3000/customer/dashboard")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(10, "12. Customer Portal Dashboard", "Context provided earlier: Dedicated customer view linked directly to backend DB")

        await page.goto("http://localhost:3000/customer/quotations/Q-1042")
        await page.wait_for_timeout(1000)
        await page.evaluate(INJECT_JS)
        await capture_seconds(15, "12. Customer Quote Acceptance", "Customer portal view for accepting/rejecting quotations & downloading PDFs")

        await browser.close()

    writer.close()
    print(f"VIDEO GENERATED SUCCESSFULLY: {OUTPUT_MP4}")

if __name__ == '__main__':
    asyncio.run(run())
