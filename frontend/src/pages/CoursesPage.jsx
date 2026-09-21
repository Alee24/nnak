import React, { useState, useEffect } from 'react';
import { Flag, Plus, CheckCircle, Edit, Settings } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getCourses();
      if (res.data) setCourses(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Golf Courses & Holes</h1>
          <p className="text-xs text-slate-500 font-medium">Configure courses, pars, stroke index and tee boxes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{course.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{course.num_holes} Holes • Par {course.par} • CR: {course.course_rating} / SR: {course.slope_rating}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${course.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {course.status}
              </span>
            </div>

            <div className="text-xs text-slate-500">
              Location: {course.location || 'Nairobi, Kenya'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
