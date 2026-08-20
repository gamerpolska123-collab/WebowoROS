import Redis from 'ioredis';
import * as escpos from 'escpos';
import * as escposUsb from 'escpos-usb';

interface ReceiptOrder {
  orderNumber?: string;
  orderId?: string;
  items?: {
    product?: { name?: string };
    name?: string;
    quantity?: number;
    unitPrice?: number;
    price?: number;
  }[];
  totalAmount?: number;
  finalAmount?: number;
}

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// Konfiguracja drukarki
let printer: unknown = null;
let device: unknown = null;

function initPrinter() {
  try {
    device = new escpos.USB();
    const options = { encoding: "CP852" }; // Polish encoding
    printer = new escpos.Printer(device, options);
    console.log("✅ Printer initialized via USB");
    return true;
  } catch (err: unknown) {
    console.warn("⚠️ No USB printer found — falling back to console output");
    return false;
  }
}

function formatReceipt(order: ReceiptOrder): string {
  const lines: string[] = [];
  lines.push("=".repeat(42));
  lines.push("         WEBOWOROS — BILET Wewnętrzny");
  lines.push("=".repeat(42));
  lines.push(`Nr zamówienia: ${order.orderNumber || order.orderId}`);
  lines.push(`Data: ${new Date().toLocaleString("pl-PL")}`);
  lines.push("-".repeat(42));

  if (order.items) {
    lines.push("PRODUKTY:");
    for (const item of order.items) {
      const name = item.product?.name || item.name || "Produkt";
      const qty = item.quantity || 1;
      const price = Number(item.unitPrice || item.price || 0).toFixed(2);
      lines.push(`  ${qty}x ${name}`);
      lines.push(`     ${price} zł/szt`);
    }
  }

  lines.push("-".repeat(42));
  if (order.totalAmount) {
    lines.push(`SUMA: ${Number(order.totalAmount).toFixed(2)} zł`);
  }
  if (order.finalAmount && order.finalAmount !== order.totalAmount) {
    lines.push(`DO ZAPŁATY: ${Number(order.finalAmount).toFixed(2)} zł`);
  }
  lines.push("=".repeat(42));
  lines.push("Dziękujemy za zamówienie!");
  lines.push("Smacznego! 🍕");
  lines.push("=".repeat(42));
  lines.push("\n\n\n");

  return lines.join("\n");
}

async function printReceipt(order: ReceiptOrder) {
  const receiptText = formatReceipt(order);

  if (printer && device) {
    try {
      device.open((err: Error | null) => {
        if (err) {
          console.error("Printer open error:", err.message);
          console.log("\n=== CONSOLE RECEIPT ===");
          console.log(receiptText);
          console.log("========================\n");
          return;
        }
        printer
          .font("a")
          .align("ct")
          .style("bu")
          .size(1, 1)
          .text(receiptText)
          .cut()
          .close();
        console.log(`🖨️ Printed receipt for order ${order.orderNumber || order.orderId}`);
      });
    } catch (e) {
      console.error("Print error:", e);
      console.log("\n=== CONSOLE RECEIPT ===");
      console.log(receiptText);
      console.log("========================\n");
    }
  } else {
    console.log("\n=== CONSOLE RECEIPT ===");
    console.log(receiptText);
    console.log("========================\n");
  }
}

async function main() {
  console.log("🖨️  Printer Service starting...");

  const hasPrinter = initPrinter();
  if (!hasPrinter) {
    console.log("📋 Console-only mode (no physical printer detected)");
  }

  // Subskrypcja Redis
  const subscriber = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

  await subscriber.subscribe("orders:new");
  await subscriber.subscribe("kitchen:new");

  subscriber.on("message", (channel, message) => {
    try {
      const order = JSON.parse(message);
      console.log(`📨 Received ${channel} for order ${order.orderNumber || order.orderId}`);
      printReceipt(order);
    } catch (e) {
      console.error("Failed to parse Redis message:", e);
    }
  });

  console.log("📡 Subscribed to Redis channels: orders:new, kitchen:new");

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    await subscriber.unsubscribe();
    await subscriber.quit();
    await redis.quit();
    console.log("Redis connections closed.");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Keep process alive
  setInterval(() => {}, 1000);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
