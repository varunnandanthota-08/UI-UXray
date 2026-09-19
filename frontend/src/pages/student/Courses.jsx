import React, { useEffect, useState } from 'react';
import studentApi from '../../api/studentApi';
import CourseCard from '../../components/student/CourseCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { BookOpen } from 'lucide-react';

export const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await studentApi.getCourses();
        setCourses(res.data || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-brand-text-primary">
              Enrolled Courses
            </h1>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Barabari Collective product and interaction design curriculum.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
