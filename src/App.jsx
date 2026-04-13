import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Users, ClipboardList, CalendarCheck2, AlertTriangle, LogOut, Plus, Search, Trash2, LockKeyhole } from "lucide-react";

const STORAGE_KEY = "control_docente_real_v3";
const SESSION_KEY = "control_docente_session_v1";
const OWNER_KEY = "control_docente_owner_v1";
const STATUS_ACTIVITY = ["E", "T", "F"];
const STATUS_ATTENDANCE = ["P", "A", "J"];

const seedData = {
  settings: { ownerUser: "adrian", riskActivities: 0.6, followActivities: 0.85, riskAttendance: 0.8 },
  semesters: [
    { id: "sem2", name: "2° semestre", order: 2 },
    { id: "sem4", name: "4° semestre", order: 4 },
    { id: "sem6", name: "6° semestre", order: 6 },
  ],
  courses: [
    { id: "c1", semesterId: "sem2", name: "Cultura digital", group: "A", teacher: "Docente", period: "2026" },
    { id: "c2", semesterId: "sem2", name: "Mantenimiento y redes", group: "A", teacher: "Docente", period: "2026" },
    { id: "c3", semesterId: "sem4", name: "Taller de cultura", group: "A", teacher: "Docente", period: "2026" },
    { id: "c4", semesterId: "sem6", name: "Programación web", group: "A", teacher: "Docente", period: "2026" },
  ],
  units: [
    { id: "u1", courseId: "c1", number: 1, name: "Unidad 1" },
    { id: "u2", courseId: "c1", number: 2, name: "Unidad 2" },
    { id: "u3", courseId: "c2", number: 1, name: "Unidad 1" },
    { id: "u4", courseId: "c2", number: 2, name: "Unidad 2" },
    { id: "u5", courseId: "c3", number: 1, name: "Unidad 1" },
    { id: "u6", courseId: "c4", number: 1, name: "Unidad 1" },
    { id: "u7", courseId: "c4", number: 2, name: "Unidad 2" },
  ],
  students: [
    { id: "s1", courseId: "c2", no: 1, name: "Valeria", observations: "" },
    { id: "s2", courseId: "c4", no: 1, name: "José Miguel Ortiz", observations: "" },
    { id: "s3", courseId: "c1", no: 1, name: "Ayala Aguilar Emilia Desire", observations: "" },
  ],
  activities: [
    { id: "a1", unitId: "u1", order: 1, title: "Mapa mental 1" },
    { id: "a2", unitId: "u1", order: 2, title: "Definiciones" },
    { id: "a3", unitId: "u1", order: 3, title: "Reflexión" },
    { id: "a4", unitId: "u2", order: 1, title: "Actividad unidad 2" },
    { id: "a5", unitId: "u3", order: 1, title: "Mapa mental 1" },
    { id: "a6", unitId: "u3", order: 2, title: "Mapa mental 2" },
    { id: "a7", unitId: "u3", order: 3, title: "Diferencias" },
    { id: "a8", unitId: "u3", order: 4, title: "Investigación procesador" },
    { id: "a9", unitId: "u6", order: 1, title: "Sitio web" },
    { id: "a10", unitId: "u6", order: 2, title: "Receta de cocina" },
    { id: "a11", unitId: "u7", order: 1, title: "Proyecto unidad 2" },
  ],
  submissions: [
    { id: "sb1", studentId: "s1", activityId: "a5", status: "E" },
    { id: "sb2", studentId: "s1", activityId: "a6", status: "E" },
    { id: "sb3", studentId: "s1", activityId: "a7", status: "E" },
    { id: "sb4", studentId: "s2", activityId: "a9", status: "E" },
    { id: "sb5", studentId: "s3", activityId: "a1", status: "E" },
    { id: "sb6", studentId: "s3", activityId: "a2", status: "T" },
  ],
  exams: [
    { id: "ex1", studentId: "s3", unitId: "u1", score: 8.5 },
    { id: "ex2", studentId: "s1", unitId: "u3", score: 9.2 },
    { id: "ex3", studentId: "s2", unitId: "u6", score: 9.0 },
  ],
  finalGrades: [
    { id: "fg1", studentId: "s3", unitId: "u1", score: 8.8 },
    { id: "fg2", studentId: "s1", unitId: "u3", score: 9.1 },
    { id: "fg3", studentId: "s2", unitId: "u6", score: 9.0 },
  ],
  attendanceSessions: [
    { id: "as1", courseId: "c1", label: "C1" },
    { id: "as2", courseId: "c1", label: "C2" },
    { id: "as3", courseId: "c2", label: "C1" },
    { id: "as4", courseId: "c2", label: "C2" },
    { id: "as5", courseId: "c4", label: "C1" },
  ],
  attendanceRecords: [],
};

function uid(prefix = "id") { return `${prefix}_${Math.random().toString(36).slice(2, 10)}`; }
function loadLocalData() { try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : seedData; } catch { return seedData; } }
function getOwnerCredentials() { try { const raw = localStorage.getItem(OWNER_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }
function setOwnerCredentials(user, password) { localStorage.setItem(OWNER_KEY, JSON.stringify({ user, password })); }
function setSession(active) { active ? sessionStorage.setItem(SESSION_KEY, "active") : sessionStorage.removeItem(SESSION_KEY); }
function getSession() { return sessionStorage.getItem(SESSION_KEY) === "active"; }

function calculateActivityMetrics(studentId, unitId, data) {
  const activities = data.activities.filter((a) => a.unitId === unitId);
  const records = data.submissions.filter((s) => s.studentId === studentId && activities.some((a) => a.id === s.activityId));
  const total = activities.length || 0;
  const delivered = records.filter((r) => r.status === "E").length;
  const late = records.filter((r) => r.status === "T").length;
  const missing = Math.max(total - delivered - late, 0);
  const completion = total ? (delivered + late * 0.8) / total : 0;
  let state = "Al día";
  if (completion < data.settings.riskActivities) state = "Riesgo";
  else if (completion < data.settings.followActivities) state = "Seguimiento";
  return { total, delivered, late, missing, completion, state };
}

function calculateAttendanceMetrics(studentId, courseId, data) {
  const sessions = data.attendanceSessions.filter((s) => s.courseId === courseId);
  const records = data.attendanceRecords.filter((r) => r.studentId === studentId && sessions.some((s) => s.id === r.sessionId));
  const total = sessions.length || 0;
  const present = records.filter((r) => r.status === "P").length;
  const justified = records.filter((r) => r.status === "J").length;
  const absent = records.filter((r) => r.status === "A").length;
  const attendance = total ? (present + justified) / total : 0;
  const state = attendance < data.settings.riskAttendance ? "Riesgo" : "Al día";
  return { total, present, justified, absent, attendance, state };
}

export default function ControlDocenteReal() {
  const [data, setData] = useState(loadLocalData);
  const [authenticated, setAuthenticated] = useState(getSession());
  const [authError, setAuthError] = useState("");
  const [login, setLogin] = useState({ user: "", password: "" });
  const [setup, setSetup] = useState({ user: "adrian", password: "", confirm: "" });
  const [selectedSemester, setSelectedSemester] = useState(seedData.semesters[0].id);
  const [selectedCourse, setSelectedCourse] = useState(seedData.courses[0].id);
  const [selectedUnit, setSelectedUnit] = useState(seedData.units[0].id);
  const [studentSearch, setStudentSearch] = useState("");
  const [newStudent, setNewStudent] = useState({ no: "", name: "", courseId: seedData.courses[0].id });
  const [newActivity, setNewActivity] = useState("");
  const [newCourse, setNewCourse] = useState({ name: "", semesterId: seedData.semesters[0].id, group: "A", teacher: "Docente", period: "2026" });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);

  const ownerExists = !!getOwnerCredentials();
  const semesters = [...data.semesters].sort((a, b) => a.order - b.order);
  const semesterCourses = data.courses.filter((c) => c.semesterId === selectedSemester);
  const currentCourse = data.courses.find((c) => c.id === sel
