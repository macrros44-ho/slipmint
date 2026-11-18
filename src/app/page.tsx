"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Printer, Lock, Sparkles, CheckCircle2, Upload, ShieldCheck, KeyRound } from "lucide-react";

interface InvoiceItem { id: string; description: string; quantity: number; price: number; }
const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar ($)" },
  { code: "EUR", symbol: "€", name: "Euro (€)" },
  { code: "GBP", symbol: "£", name: "British Pound (£)" },
];

const CHECKOUT_URL = "https://buy.polar.sh/polar_cl_Fr5Yft91JLGpVKmIZNQFsSVGLWUIIZseqPlkZ1tgxQD";
const POLAR_ORG_ID = "3851acd2-8bdb-481e-a441-00c674baad5a";

export default function SlipMintApp() {
  const [isPro, setIsPro] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | "refund" | null>(null);

  const [invoiceNumber, setInvoiceNumber] = useState("INV-2026-001");
  const [issueDate, setIssueDate] = useState("2026-11-17");
  const [dueDate, setDueDate] = useState("2026-12-01");
  const [currency, setCurrency] = useState(CURRENCIES.at(0)!);
  const [fromName, setFromName] = useState("Alex Morgan Studio");
  const [fromEmail, setFromEmail] = useState("alex@morganstudio.com");
  const [fromAddress, setFromAddress] = useState("123 Creator Ave, New York, NY");
  const [toName, setToName] = useState("Acme Corp");
  const [toEmail, setToEmail] = useState("billing@acmecorp.com");
  const [toAddress, setToAddress] = useState("456 Business Rd, San Francisco, CA");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "UI/UX Design & Landing Page", quantity: 1, price: 850 },
    { id: "2", description: "Brand Asset Kit", quantity: 2, price: 150 },
  ]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [notes, setNotes] = useState("Thank you for your business! Payment is due within 14 days.");
  const [showProModal, setShowProModal] = useState(false);

  const [licenseKey, setLicenseKey] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [licenseError, setLicenseError] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("slipmint_license_key");
    if (savedKey) {
      setIsPro(true);
    }
  }, []);

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = licenseKey.trim();
    if (!trimmedKey) {
      setLicenseError("Please enter your license key.");
      return;
    }

    setVerifying(true);
    setLicenseError("");

    try {
      const response = await fetch("https://api.polar.sh/v1/customer-portal/license-keys/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: trimmedKey,
          organization_id: POLAR_ORG_ID,
          label: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 60) : "Web Browser",
        }),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        localStorage.setItem("slipmint_license_key", trimmedKey);
        localStorage.setItem("slipmint_activation_id", data.id);
        setIsPro(true);
        setShowProModal(false);
        setLicenseKey("");
      } else {
        setLicenseError(data.detail || "Invalid license key or activation limit reached.");
      }
    } catch {
      setLicenseError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (file) setLogoUrl(URL.createObjectURL(file));
  };

  const addItem = () => setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, price: 0 }]);
  const removeItem = (id: string) => items.length > 1 && setItems(items.filter((i) => i.id !== id));
  const updateItem = (id: string, field: keyof InvoiceItem, val: string | number) =>
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: val } : i)));

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col justify-between">
      <div>
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between print:hidden sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="font-bold text-xl tracking-tight">SlipMint</span>
            {isPro ? (
              <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">PRO UNLOCKED</span>
            ) : (
              <span className="ml-2 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium">Free Instant Invoice</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isPro && (
              <button onClick={() => setShowProModal(true)} className="flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-lg cursor-pointer">
                <Sparkles className="w-4 h-4 text-amber-600" /> Upgrade to Pro ($19)
              </button>
            )}
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm cursor-pointer">
              <Printer className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 print:p-0 print:block">
          <section className="lg:col-span-5 space-y-5 print:hidden">
            {isPro ? (
              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Upload className="w-4 h-4" /></div>
                  <div><p className="text-sm font-semibold">Custom Brand Logo (Pro)</p><p className="text-xs text-slate-500">Watermark automatically removed</p></div>
                </div>
                <label className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg cursor-pointer">
                  Upload Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div onClick={() => setShowProModal(true)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-emerald-400 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Lock className="w-4 h-4" /></div>
                  <div><p className="text-sm font-semibold">Add Custom Logo & Remove Watermark</p><p className="text-xs text-slate-500">Unlock clean client-ready PDFs forever</p></div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">PRO</span>
              </div>
            )}

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="font-semibold text-xs uppercase tracking-wider text-slate-500">Invoice Details</h2>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-slate-600 mb-1">Invoice #</label><input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs text-slate-600 mb-1">Currency</label><select value={currency.code} onChange={(e) => setCurrency(CURRENCIES.find((c) => c.code === e.target.value) || CURRENCIES.at(0)!)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">{CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select></div>
                <div><label className="block text-xs text-slate-600 mb-1">Issue Date</label><input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs text-slate-600 mb-1">Due Date</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
              <h2 className="font-semibold text-xs uppercase tracking-wider text-slate-500">From & Bill To</h2>
              <input type="text" placeholder="Your Name" value={fromName} onChange={(e) => setFromName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <input type="email" placeholder="Your Email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <input type="text" placeholder="Your Address" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <hr className="border-slate-100" />
              <input type="text" placeholder="Client Name" value={toName} onChange={(e) => setToName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <input type="email" placeholder="Client Email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <input type="text" placeholder="Client Address" value={toAddress} onChange={(e) => setToAddress(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="font-semibold text-xs uppercase tracking-wider text-slate-500">Line Items</h2>
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 0)} className="w-16 border border-slate-300 rounded-lg px-2 py-2 text-sm text-center" />
                  <input type="number" min="0" value={item.price} onChange={(e) => updateItem(item.id, "price", Number(e.target.value) || 0)} className="w-24 border border-slate-300 rounded-lg px-2 py-2 text-sm text-right" />
                  <button onClick={() => removeItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={addItem} className="flex items-center gap-1 text-sm font-medium text-emerald-600 cursor-pointer"><Plus className="w-4 h-4" /> Add Item</button>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <label className="text-sm text-slate-600">Tax Rate (%)</label>
                <input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)} className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-right" />
              </div>
              <textarea rows={2} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </section>

          <section className="lg:col-span-7 print:w-full">
            <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-md min-h-[800px] flex flex-col justify-between print:shadow-none print:border-none print:p-0">
              <div>
                <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                  <div>
                    {logoUrl && <img src={logoUrl} alt="Brand Logo" className="h-12 mb-3 object-contain" />}
                    <h1 className="text-3xl font-extrabold tracking-tight">INVOICE</h1>
                    <p className="text-sm text-slate-500 mt-1">#{invoiceNumber}</p>
                  </div>
                  <div className="text-right text-sm text-slate-600 space-y-1">
                    <p><span className="text-slate-400">Issue Date:</span> <b>{issueDate}</b></p>
                    <p><span className="text-slate-400">Due Date:</span> <b>{dueDate}</b></p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 py-6 text-sm">
                  <div><p className="text-xs font-bold uppercase text-slate-400 mb-1">From</p><p className="font-bold text-base">{fromName}</p><p className="text-slate-600">{fromEmail}</p><p className="text-slate-600">{fromAddress}</p></div>
                  <div><p className="text-xs font-bold uppercase text-slate-400 mb-1">Bill To</p><p className="font-bold text-base">{toName}</p><p className="text-slate-600">{toEmail}</p><p className="text-slate-600">{toAddress}</p></div>
                </div>
                <table className="w-full text-left border-collapse mt-2">
                  <thead><tr className="border-b-2 border-slate-900 text-xs uppercase text-slate-500"><th className="py-2.5">Description</th><th className="py-2.5 text-center w-16">Qty</th><th className="py-2.5 text-right w-24">Price</th><th className="py-2.5 text-right w-24">Amount</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {items.map((item) => (
                      <tr key={item.id}><td className="py-3.5 font-medium">{item.description || "Untitled"}</td><td className="py-3.5 text-center text-slate-600">{item.quantity}</td><td className="py-3.5 text-right text-slate-600">{currency.symbol}{item.price.toFixed(2)}</td><td className="py-3.5 text-right font-semibold">{currency.symbol}{(item.quantity * item.price).toFixed(2)}</td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mt-6">
                  <div className="w-60 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{currency.symbol}{subtotal.toFixed(2)}</span></div>
                    {taxRate > 0 && <div className="flex justify-between text-slate-600"><span>Tax ({taxRate}%)</span><span>{currency.symbol}{taxAmount.toFixed(2)}</span></div>}
                    <div className="flex justify-between border-t-2 border-slate-900 pt-2.5 text-base font-bold"><span>Total Due</span><span>{currency.symbol}{total.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-4 border-t border-slate-100">
                {notes && <p className="text-sm text-slate-600 mb-4">{notes}</p>}
                {!isPro && (
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Generated with SlipMint</span>
                    <span className="print:hidden text-emerald-600 font-medium">Free Edition</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-6 px-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /><span>© 2026 SlipMint (operated by ho-works). All rights reserved.</span></div>
          <div className="flex gap-5">
            <button onClick={() => setLegalModal("terms")} className="hover:text-slate-800 underline cursor-pointer">Terms of Service</button>
            <button onClick={() => setLegalModal("privacy")} className="hover:text-slate-800 underline cursor-pointer">Privacy Policy</button>
            <button onClick={() => setLegalModal("refund")} className="hover:text-slate-800 underline cursor-pointer">Refund Policy</button>
            <a href="mailto:macrros44@gmail.com" className="hover:text-slate-800 underline">Contact</a>
          </div>
        </div>
      </footer>

      {showProModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">SlipMint Pro</span><button onClick={() => setShowProModal(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">Close ✕</button></div>
            <h3 className="text-xl font-bold">Send Cleaner, Branded Invoices</h3>
            <p className="text-sm text-slate-600">One-time payment. Lifetime access. No monthly subscription.</p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Remove &quot;Generated with SlipMint&quot; watermark</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Upload your custom brand logo</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Unlimited clean client-ready PDF exports</li>
            </ul>
            <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="block text-center w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow cursor-pointer">
              Get Lifetime Pro — $19
            </a>

            <div className="pt-4 border-t border-slate-100">
              <form onSubmit={handleActivateLicense} className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Already purchased? Enter License Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="SLIP-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase"
                  />
                  <button
                    type="submit"
                    disabled={verifying}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer"
                  >
                    {verifying ? "Checking..." : "Activate"}
                  </button>
                </div>
                {licenseError && <p className="text-xs text-red-600">{licenseError}</p>}
              </form>
            </div>
          </div>
        </div>
      )}

      {legalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-sm text-slate-600">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {legalModal === "terms" && "Terms of Service"}
                {legalModal === "privacy" && "Privacy Policy"}
                {legalModal === "refund" && "Refund Policy"}
              </h3>
              <button onClick={() => setLegalModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">Close ✕</button>
            </div>
            {legalModal === "terms" && <p>SlipMint provides instant browser-based invoice generation tools provided &quot;as is&quot;. You are solely responsible for the accuracy of tax rates, billing details, and legal compliance of invoices you issue.</p>}
            {legalModal === "privacy" && <p>We respect your privacy. All invoice data you type is processed locally in your browser and is never uploaded to our servers. Payments and license verification are securely processed by our Merchant of Record, Polar.sh (Polar Software, Inc.).</p>}
            {legalModal === "refund" && <p>Due to the instant digital nature of SlipMint Pro Lifetime Access, all sales are generally final once Pro features are unlocked. If you experience technical issues, contact macrros44@gmail.com within 7 days for assistance.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
