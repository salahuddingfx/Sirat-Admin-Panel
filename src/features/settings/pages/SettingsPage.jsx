import { useState, useEffect, useRef } from "react";
import { Save, Phone, Mail, MapPin, Globe, Share2, CreditCard, Image as ImageIcon, Upload } from "lucide-react";
import { fetchSettings, updateSettings } from "../../../lib/api/queries";
import { Button, Input, Card, SectionHeader } from "../../../components/ui";
import { triggerAdminToast } from "../../../components/ui/AdminToast";

const FORM_CONTAINER_STYLE = { marginTop: "2rem", display: "grid", gap: "2rem" };
const CARD_PADDING_STYLE = { padding: "2rem" };
const SECTION_HEADER_STYLE = { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" };
const SECTION_TITLE_STYLE = { margin: 0 };
const BRANDING_GRID_STYLE = { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", alignItems: "start" };
const LOGO_BOX_STYLE = {
  width: "100%",
  height: "150px",
  border: "2px dashed var(--color-border-strong)",
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--color-bg)",
  cursor: "pointer",
  overflow: "hidden",
  position: "relative"
};
const LOGO_IMAGE_STYLE = { width: "100%", height: "100%", objectFit: "contain", padding: "10px" };
const LOGO_UPLOAD_OVERLAY = { position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "4px", color: "#fff", fontSize: "10px" };
const LOGO_CASH_HELP = { fontSize: "0.7rem" };
const CONTACT_GRID_STYLE = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" };
const PAYMENT_GRID_STYLE = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" };
const SOCIAL_GRID_STYLE = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" };
const ACTION_CONTAINER_STYLE = { display: "flex", justifyContent: "flex-end" };

export function SettingsPage() {
  const [settings, setSettings] = useState({
    phone: "",
    email: "",
    address: "",
    facebook: "",
    instagram: "",
    whatsapp: "",
    tagline: "",
    description: "",
    logo: "",
    bkashNumber: "",
    nagadNumber: "",
    rocketNumber: "",
    pinterest: "",
    youtube: "",
    tiktok: "",
    twitter: ""
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetchSettings();
        if (res.success && res.data) {
          setSettings({
            phone: res.data.phone || "",
            email: res.data.email || "",
            address: res.data.address || "",
            facebook: res.data.facebook || "",
            instagram: res.data.instagram || "",
            whatsapp: res.data.whatsapp || "",
            tagline: res.data.tagline || "",
            description: res.data.description || "",
            logo: res.data.logo || "",
            bkashNumber: res.data.bkashNumber || "",
            nagadNumber: res.data.nagadNumber || "",
            rocketNumber: res.data.rocketNumber || "",
            pinterest: res.data.pinterest || "",
            youtube: res.data.youtube || "",
            tiktok: res.data.tiktok || "",
            twitter: res.data.twitter || ""
          });
        }
      } catch (err) {
        console.error(err);
        triggerAdminToast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Create FormData payload for multipart/form-data upload
    const data = new FormData();
    Object.keys(settings).forEach(key => {
      if (key !== "logo") {
        data.append(key, settings[key]);
      }
    });
    if (logoFile) {
      data.append("logo", logoFile);
    }

    try {
      const res = await updateSettings(data);
      if (res.success && res.data) {
        setSettings({
          phone: res.data.phone || "",
          email: res.data.email || "",
          address: res.data.address || "",
          facebook: res.data.facebook || "",
          instagram: res.data.instagram || "",
          whatsapp: res.data.whatsapp || "",
          tagline: res.data.tagline || "",
          description: res.data.description || "",
          logo: res.data.logo || "",
          bkashNumber: res.data.bkashNumber || "",
          nagadNumber: res.data.nagadNumber || "",
          rocketNumber: res.data.rocketNumber || "",
          pinterest: res.data.pinterest || "",
          youtube: res.data.youtube || "",
          tiktok: res.data.tiktok || "",
          twitter: res.data.twitter || ""
        });
        setLogoFile(null);
        setLogoPreview(null);
        triggerAdminToast("Settings updated successfully", "success");
      } else {
        triggerAdminToast(res.message || "Failed to update settings", "error");
      }
    } catch (err) {
      console.error(err);
      triggerAdminToast(err.response?.data?.message || "Failed to update settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <SectionHeader title="Site Settings" description="Manage your store configuration." />
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p className="muted">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Branding & API"
        title="Site Settings"
        description="Configure storefront metadata, logos, payment checkout phone numbers, and social URLs."
      />

      <form onSubmit={handleSubmit} style={FORM_CONTAINER_STYLE}>

        {/* Branding & Logo */}
        <Card className="product-card" style={CARD_PADDING_STYLE}>
          <div style={SECTION_HEADER_STYLE}>
            <Globe className="accent" size={20} />
            <h3 style={SECTION_TITLE_STYLE}>Branding & Logo</h3>
          </div>
          <div style={BRANDING_GRID_STYLE}>

            {/* Logo Upload Box */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <span className="input-label" style={{ fontWeight: 600 }}>Website Logo</span>
              <div
                style={LOGO_BOX_STYLE}
                onClick={() => fileInputRef.current.click()}
              >
                {logoPreview || settings.logo ? (
                  <img
                    src={logoPreview || settings.logo}
                    alt="Store Logo"
                    style={LOGO_IMAGE_STYLE}
                  />
                ) : (
                  <>
                    <ImageIcon size={28} className="muted" style={{ marginBottom: "0.5rem" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)" }}>Upload Logo</span>
                  </>
                )}

                <div style={LOGO_UPLOAD_OVERLAY}>
                  <Upload size={10} /> Choose
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleLogoChange}
              />
              <span className="muted" style={LOGO_CASH_HELP}>PNG or WebP with transparent background recommended.</span>
            </div>

            <div style={{ display: "grid", gap: "1.25rem" }}>
              <Input
                label="Store Tagline"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                placeholder="e.g. Purity in Every Step"
                required
              />
              <div className="input-group">
                <label className="input-label">Description / About text</label>
                <textarea
                  className="input-field"
                  name="description"
                  value={settings.description}
                  onChange={handleChange}
                  placeholder="Write a brief description of your brand..."
                  rows={4}
                  required
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </div>

          </div>
        </Card>

        {/* Contact Info */}
        <Card className="product-card" style={CARD_PADDING_STYLE}>
          <div style={SECTION_HEADER_STYLE}>
            <Phone className="accent" size={20} />
            <h3 style={SECTION_TITLE_STYLE}>Contact Details</h3>
          </div>
          <div style={CONTACT_GRID_STYLE}>
            <Input
              label="Contact Phone"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              placeholder="+880 1700 000000"
              required
            />
            <Input
              label="Contact Email"
              name="email"
              type="email"
              value={settings.email}
              onChange={handleChange}
              placeholder="hello@siratclothing.com"
              required
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <Input
                label="Store Address"
                name="address"
                value={settings.address}
                onChange={handleChange}
                placeholder="Dhaka, Bangladesh"
                required
              />
            </div>
          </div>
        </Card>

        {/* Payment Configuration */}
        <Card className="product-card" style={CARD_PADDING_STYLE}>
          <div style={SECTION_HEADER_STYLE}>
            <CreditCard className="accent" size={20} />
            <h3 style={SECTION_TITLE_STYLE}>Mobile Merchant Numbers</h3>
          </div>
          <div style={PAYMENT_GRID_STYLE}>
            <Input
              label="bKash Personal/Merchant Number"
              name="bkashNumber"
              value={settings.bkashNumber}
              onChange={handleChange}
              placeholder="e.g. 017XXXXXXXX"
            />
            <Input
              label="Nagad Personal/Merchant Number"
              name="nagadNumber"
              value={settings.nagadNumber}
              onChange={handleChange}
              placeholder="e.g. 017XXXXXXXX"
            />
            <Input
              label="Rocket Personal/Merchant Number"
              name="rocketNumber"
              value={settings.rocketNumber}
              onChange={handleChange}
              placeholder="e.g. 017XXXXXXXX"
            />
          </div>
        </Card>

        {/* Social Links */}
        <Card className="product-card" style={CARD_PADDING_STYLE}>
          <div style={SECTION_HEADER_STYLE}>
            <Share2 className="accent" size={20} />
            <h3 style={SECTION_TITLE_STYLE}>Social Media Links</h3>
          </div>
          <div style={SOCIAL_GRID_STYLE}>
            <Input
              label="Facebook Page URL"
              name="facebook"
              value={settings.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/yourpage"
            />
            <Input
              label="Instagram Profile URL"
              name="instagram"
              value={settings.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/yourbrand"
            />
            <Input
              label="WhatsApp Support URL"
              name="whatsapp"
              value={settings.whatsapp}
              onChange={handleChange}
              placeholder="https://wa.me/8801700000000"
            />
            <Input
              label="Pinterest Profile URL"
              name="pinterest"
              value={settings.pinterest}
              onChange={handleChange}
              placeholder="https://pinterest.com/yourbrand"
            />
            <Input
              label="YouTube Channel URL"
              name="youtube"
              value={settings.youtube}
              onChange={handleChange}
              placeholder="https://youtube.com/c/yourchannel"
            />
            <Input
              label="TikTok Profile URL"
              name="tiktok"
              value={settings.tiktok}
              onChange={handleChange}
              placeholder="https://tiktok.com/@yourbrand"
            />
            <Input
              label="Twitter/X Profile URL"
              name="twitter"
              value={settings.twitter}
              onChange={handleChange}
              placeholder="https://x.com/yourbrand"
            />
          </div>
        </Card>

        {/* Action Button */}
        <div style={ACTION_CONTAINER_STYLE}>
          <Button type="submit" disabled={isSaving} style={{ gap: "0.5rem" }}>
            <Save size={18} /> {isSaving ? "Saving Configuration..." : "Save Settings"}
          </Button>
        </div>

      </form>
    </div>
  );
}
