import { useState, useEffect } from "react";
import { Save, Settings, Phone, Mail, MapPin, Globe, Share2 } from "lucide-react";
import { fetchSettings, updateSettings } from "../../../lib/api/queries";
import { Button, Input, Card, SectionHeader } from "../../../components/ui";
import { triggerAdminToast } from "../../../components/ui/AdminToast";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    phone: "",
    email: "",
    address: "",
    facebook: "",
    instagram: "",
    whatsapp: "",
    tagline: "",
    description: ""
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetchSettings();
        if (res.success && res.data) {
          setSettings(res.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateSettings(settings);
      if (res.success && res.data) {
        setSettings(res.data);
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
        title="Site Settings"
        description="Manage your storefront's branding, contact information, and social links."
      />

      <form onSubmit={handleSubmit} style={{ marginTop: "2rem", display: "grid", gap: "2rem" }}>
        
        {/* Branding & SEO */}
        <Card className="product-card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Globe className="accent" size={20} />
            <h3 style={{ margin: 0 }}>Branding & General Info</h3>
          </div>
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <Input
              label="Tagline"
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
        </Card>

        {/* Contact Info */}
        <Card className="product-card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Phone className="accent" size={20} />
            <h3 style={{ margin: 0 }}>Contact Details</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
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

        {/* Social Links */}
        <Card className="product-card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Share2 className="accent" size={20} />
            <h3 style={{ margin: 0 }}>Social Links</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            <Input
              label="Facebook URL"
              name="facebook"
              value={settings.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/yourpage"
            />
            <Input
              label="Instagram URL"
              name="instagram"
              value={settings.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/yourbrand"
            />
            <Input
              label="WhatsApp Link/Number"
              name="whatsapp"
              value={settings.whatsapp}
              onChange={handleChange}
              placeholder="https://wa.me/8801700000000"
            />
          </div>
        </Card>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <Button type="submit" disabled={isSaving} style={{ gap: "0.5rem" }}>
            <Save size={18} /> {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

      </form>
    </div>
  );
}
