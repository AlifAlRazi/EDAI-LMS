"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, CreditCard, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock Data
const revenueData = [
  { name: "Mon", total: 1200 },
  { name: "Tue", total: 2100 },
  { name: "Wed", total: 1800 },
  { name: "Thu", total: 3200 },
  { name: "Fri", total: 2800 },
  { name: "Sat", total: 4100 },
  { name: "Sun", total: 3800 },
];

const topCourses = [
  { name: "Intro to AI", students: 1200 },
  { name: "Advanced ML", students: 850 },
  { name: "Data Science", students: 640 },
  { name: "Python Basics", students: 480 },
];

const stats = [
  { title: "Total Students", value: "2,405", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
  { title: "Active Courses", value: "14", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10" },
  { title: "Total Revenue", value: "$45,231", icon: CreditCard, color: "text-green-400", bg: "bg-green-500/10" },
  { title: "Avg. Completion", value: "68%", icon: Activity, color: "text-orange-400", bg: "bg-orange-500/10" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card className="bg-dark-100 border-white/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/50">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Array */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-dark-100 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Revenue (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
                    <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: "#1e1e2d", border: "1px solid #ffffff10", borderRadius: "8px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Courses Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-dark-100 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Top Courses by Enrollment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCourses} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                    <XAxis type="number" stroke="#ffffff50" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#ffffff70" axisLine={false} tickLine={false} width={100} />
                    <RechartsTooltip 
                      cursor={{ fill: "#ffffff05" }}
                      contentStyle={{ backgroundColor: "#1e1e2d", border: "1px solid #ffffff10", borderRadius: "8px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="students" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
