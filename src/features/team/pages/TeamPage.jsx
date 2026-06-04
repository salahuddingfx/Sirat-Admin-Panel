import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Upload, User, Github, Linkedin, Twitter, Instagram, Facebook, Globe } from "lucide-react";
import { fetchAllTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from "../../../lib/api/queries";
import { Button, Input, Card, SectionHeader } from "../../../components/ui";
import { triggerAdminToast } from "../../../components/ui/AdminToast";
import { triggerAdminConfirm } from "../../../components/ui/AdminConfirm";
import "./TeamPage.css";

const EMPTY_MEMBER = {
  name: "",
  role: "",
  bio: "",
  avatar: "",
  twitter: "",
  linkedin: "",
  github: "",
  instagram: "",
  facebook: "",
  website: "",
  order: 0,
  isActive: true,
};

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileRef = useRef(null);

  const loadMembers = async (signal) => {
    try {
      const res = await fetchAllTeamMembers({ signal });
      if (res.success) setMembers(res.data);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        console.error(err);
        triggerAdminToast("Failed to load team members", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadMembers(controller.signal);
    return () => controller.abort();
  }, []);

  const openCreateModal = () => {
    setCurrentMember(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setCurrentMember(member);
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMember(null);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleDelete = async (id) => {
    triggerAdminConfirm("Delete this team member permanently?", async () => {
      try {
        await deleteTeamMember(id);
        setMembers((prev) => prev.filter((m) => m._id !== id));
        triggerAdminToast("Team member deleted", "success");
      } catch (err) {
        triggerAdminToast("Failed to delete", "error");
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData();
    if (avatarFile) fd.append("avatar", avatarFile);
    fd.append("name", form.name.value.trim());
    fd.append("role", form.role.value.trim());
    fd.append("bio", form.bio.value.trim());
    fd.append("twitter", form.twitter.value.trim());
    fd.append("linkedin", form.linkedin.value.trim());
    fd.append("github", form.github.value.trim());
    fd.append("instagram", form.instagram.value.trim());
    fd.append("facebook", form.facebook.value.trim());
    fd.append("website", form.website.value.trim());
    fd.append("order", parseInt(form.order.value) || 0);
    fd.append("isActive", form.isActive.checked ? "true" : "false");

    if (!fd.get("name") || !fd.get("role")) {
      triggerAdminToast("Name and role are required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentMember) {
        await updateTeamMember(currentMember._id, fd);
        triggerAdminToast("Team member updated", "success");
      } else {
        await createTeamMember(fd);
        triggerAdminToast("Team member created", "success");
      }
      closeModal();
      loadMembers();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to save";
      triggerAdminToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page team-admin-page">
      <SectionHeader
        title="Team Members"
        description="Manage the people featured on the About page and developer showcase."
      >
        <Button onClick={openCreateModal}>
          <Plus size={18} /> Add Member
        </Button>
      </SectionHeader>

      <div className="team-admin-list" style={{ marginTop: "2rem" }}>
        {loading ? (
          <p>Loading members...</p>
        ) : members.length === 0 ? (
          <Card className="product-card">
            <p style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
              No team members yet. Add your first member to get started.
            </p>
          </Card>
        ) : (
          members.map((m) => (
            <Card key={m._id} className="product-card team-admin-card">
              <div className="team-admin-card__inner">
                <div className="team-admin-avatar">
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} />
                  ) : (
                    <User size={28} className="muted" />
                  )}
                </div>
                <div className="team-admin-info">
                  <div className="team-admin-info__top">
                    <div>
                      <h4 style={{ margin: 0 }}>{m.name}</h4>
                      <span className="muted" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-warning, #C5A059)" }}>
                        {m.role}
                      </span>
                    </div>
                    <span className={`badge ${m.isActive ? "badge-success" : "badge-outline"}`}>
                      {m.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                  {m.bio && (
                    <p className="muted" style={{ fontSize: "0.85rem", margin: "0.5rem 0 0", lineHeight: 1.5 }}>
                      {m.bio}
                    </p>
                  )}
                  <div className="team-admin-socials">
                    {m.twitter && <Twitter size={14} />}
                    {m.linkedin && <Linkedin size={14} />}
                    {m.github && <Github size={14} />}
                    {m.instagram && <Instagram size={14} />}
                    {m.facebook && <Facebook size={14} />}
                    {m.website && <Globe size={14} />}
                    {!m.twitter && !m.linkedin && !m.github && !m.instagram && !m.facebook && !m.website && (
                      <span style={{ fontSize: "0.75rem", opacity: 0.5 }}>No social links</span>
                    )}
                  </div>
                  <div className="team-admin-actions">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(m)}>
                      <Edit2 size={14} /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(m._id)} style={{ color: "var(--color-error)" }}>
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content team-admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{currentMember ? "Edit Member" : "Add New Member"}</h3>
            <form onSubmit={handleSubmit} className="team-admin-form">
              <div
                className="team-admin-upload"
                onClick={() => fileRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" />
                ) : currentMember?.avatar ? (
                  <img src={currentMember.avatar} alt="Current" />
                ) : (
                  <div className="team-admin-upload__placeholder">
                    <Upload size={24} />
                    <span>Click to upload avatar</span>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setAvatarFile(f);
                      setAvatarPreview(URL.createObjectURL(f));
                    }
                  }}
                />
              </div>

              <div className="team-admin-form__grid">
                <Input label="Full Name *" name="name" defaultValue={currentMember?.name || ""} required />
                <Input label="Role / Title *" name="role" defaultValue={currentMember?.role || ""} required placeholder="e.g. Founder & Creative Director" />
              </div>

              <div className="form-group">
                <label className="input-label">Bio</label>
                <textarea
                  name="bio"
                  defaultValue={currentMember?.bio || ""}
                  rows={3}
                  className="input-field"
                  placeholder="Short bio shown under the name"
                  style={{ resize: "vertical", minHeight: "80px" }}
                />
              </div>

              <p className="team-admin-form__section-label">Social Links (optional)</p>
              <div className="team-admin-form__grid">
                <Input label="Twitter / X URL" name="twitter" defaultValue={currentMember?.twitter || ""} placeholder="https://x.com/..." />
                <Input label="LinkedIn URL" name="linkedin" defaultValue={currentMember?.linkedin || ""} placeholder="https://linkedin.com/in/..." />
                <Input label="GitHub URL" name="github" defaultValue={currentMember?.github || ""} placeholder="https://github.com/..." />
                <Input label="Instagram URL" name="instagram" defaultValue={currentMember?.instagram || ""} placeholder="https://instagram.com/..." />
                <Input label="Facebook URL" name="facebook" defaultValue={currentMember?.facebook || ""} placeholder="https://facebook.com/..." />
                <Input label="Personal Website" name="website" defaultValue={currentMember?.website || ""} placeholder="https://example.com" />
              </div>

              <div className="team-admin-form__grid team-admin-form__grid--meta">
                <Input label="Display Order" name="order" type="number" defaultValue={currentMember?.order ?? 0} />
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", alignSelf: "end", paddingBottom: "0.6rem" }}>
                  <input type="checkbox" name="isActive" defaultChecked={currentMember ? currentMember.isActive : true} />
                  Visible on storefront
                </label>
              </div>

              <div className="team-admin-form__actions">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : currentMember ? "Update Member" : "Create Member"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
