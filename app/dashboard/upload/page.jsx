"use client";

import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPhotoToStore } from "../../../src/redux/slices/photoSlice";
import TopBar from "../../../components/TopBar";
import axios from "axios";

// ── Icons ─────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d={d} />
  </svg>
);

// ── constants ─────────────────────────
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

const THEMES = ["Party", "Event", "Trip", "General"];
const ENVS = ["Indoor", "Outdoor"];
const SOCIALS = ["Solo", "Couple", "Group"];

export default function UploadPage() {
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const globalPhotos = useSelector((state) => state.photos?.gallery || []);

  const [queue, setQueue] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [openTheme, setOpenTheme] = useState(null);
  const [openEnv, setOpenEnv] = useState(null);
  const [openSocial, setOpenSocial] = useState(null);

  // ── safe token ───────────────────────
  const getToken = () => {
    try {
      const t = localStorage.getItem("token");
      return t ? `Bearer ${t}` : "";
    } catch {
      return "";
    }
  };

  // ── file intake ──────────────────────
  const handleFiles = (files) => {
    const items = Array.from(files)
      .filter((f) => ACCEPTED.includes(f.type))
      .map((file) => ({
        id: `${file.name}-${Date.now()}`,
        file,
        preview: URL.createObjectURL(file),
        status: "waiting",
      }));

    setQueue((p) => [...p, ...items]);
  };

  // ── upload pipeline ──────────────────
  const runUpload = async () => {
    if (uploading) return;

    setUploading(true);

    for (const item of queue) {
      if (item.status !== "waiting") continue;

      setQueue((prev) =>
        prev.map((p) =>
          p.id === item.id ? { ...p, status: "uploading" } : p
        )
      );

      try {
        const form = new FormData();
        form.append("file", item.file);

        const res = await axios.post("/api/analyze", form, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: getToken(),
          },
        });

        if (!res.data?.success) throw new Error("Upload failed");

        const data = res.data;

        setQueue((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? { ...p, status: "done", result: data }
              : p
          )
        );

        // prevent duplicates in redux
        dispatch(addPhotoToStore(data));
      } catch (e) {
        setQueue((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, status: "error" } : p
          )
        );
      }
    }

    setUploading(false);
  };

  // ── filter photos ────────────────────
  const filtered = globalPhotos.filter((p) => {
    if (openTheme && p.category !== openTheme) return false;
    if (openEnv && p.environment !== openEnv) return false;
    if (openSocial && p.socialGroup !== openSocial) return false;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#070514", color: "#fff", padding: 24 }}>
      <TopBar title="Smart Upload System" />

      {/* ── UPLOAD AREA ───────────────── */}
      <section style={{ background: "#0f0c1e", padding: 20, borderRadius: 12 }}>
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: "2px dashed #333",
            padding: 30,
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          Drag or click to upload
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* queue */}
        {queue.length > 0 && (
          <>
            <button
              onClick={runUpload}
              disabled={uploading}
              style={{
                marginTop: 15,
                padding: "8px 12px",
                background: "#6366f1",
                color: "#fff",
                borderRadius: 8,
              }}
            >
              {uploading ? "Uploading..." : "Start Upload"}
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 15 }}>
              {queue.map((f) => (
                <div key={f.id} style={{ position: "relative" }}>
                  <img src={f.preview} style={{ width: "100%", height: 80, objectFit: "cover" }} />
                  <div style={{ fontSize: 10, textAlign: "center" }}>{f.status}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── FOLDER VIEW ───────────────── */}
      <section style={{ marginTop: 30 }}>
        <h3>Vault</h3>

        {/* Level 1 */}
        {!openTheme && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {THEMES.map((t) => (
              <div key={t} onClick={() => setOpenTheme(t)} style={card}>
                {t}
              </div>
            ))}
          </div>
        )}

        {/* Level 2 */}
        {openTheme && !openEnv && (
          <div>
            <button onClick={() => setOpenTheme(null)}>Back</button>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {ENVS.map((e) => (
                <div key={e} onClick={() => setOpenEnv(e)} style={card}>
                  {e}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Level 3 */}
        {openEnv && !openSocial && (
          <div>
            <button onClick={() => setOpenEnv(null)}>Back</button>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {SOCIALS.map((s) => (
                <div key={s} onClick={() => setOpenSocial(s)} style={card}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FINAL */}
        {openSocial && (
          <div>
            <button onClick={() => setOpenSocial(null)}>Back</button>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {filtered.map((p) => (
                <img
                  key={p._id}
                  src={p.url}
                  style={{ width: "100%", height: 120, objectFit: "cover" }}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

const card = {
  padding: 20,
  background: "#111",
  borderRadius: 10,
  cursor: "pointer",
};