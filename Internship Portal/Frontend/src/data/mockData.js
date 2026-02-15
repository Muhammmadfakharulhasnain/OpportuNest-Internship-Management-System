export const mockUsers = [
  {
    id: 1,
    name: 'Ahmad Ali',
    email: 'student@comsats.edu.pk',
    password: 'student123',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    profile: {
      rollNumber: 'FA19-BSE-001',
      cgpa: 3.2,
      semester: 7,
      attendance: 92,
      backlogs: 0,
      department: 'Software Engineering',
      phone: '+92-300-1234567'
    }
  },
  {
    id: 2,
    name: 'Tech Solutions Ltd',
    email: 'company@techsolutions.com',
    password: 'company123',
    role: 'company',
    avatar: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=400',
    profile: {
      companyName: 'Tech Solutions Ltd',
      industry: 'Software Development',
      location: 'Islamabad, Pakistan',
      website: 'www.techsolutions.com',
      phone: '+92-51-1234567',
      description: 'Leading software development company specializing in web and mobile applications.'
    }
  },
  {
    id: 3,
    name: 'Dr. Sarah Khan',
    email: 'admin@comsats.edu.pk',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400',
    profile: {
      designation: 'Internship Coordinator',
      department: 'Computer Science',
      office: 'Block A, Room 201',
      phone: '+92-57-1234567',
      extension: '2015'
    }
  },
  {
    id: 4,
    name: 'Dr. Muhammad Hassan',
    email: 'supervisor@comsats.edu.pk',
    password: 'supervisor123',
    role: 'supervisor',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
    profile: {
      designation: 'Associate Professor',
      department: 'Software Engineering',
      office: 'Block B, Room 305',
      phone: '+92-57-1234568',
      extension: '2025',
      expertise: ['Software Engineering', 'Web Development', 'Database Systems'],
      officeHours: 'Mon-Fri 10:00 AM - 12:00 PM'
    }
  }
];

export const mockJobs = [
  {
    id: 1,
    title: 'Frontend Developer Intern',
    company: 'Tech Solutions Ltd',
    companyId: 2,
    location: 'Islamabad',
    type: 'Remote',
    duration: '3 months',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    deadline: '2024-05-15',
    paid: true,
    description: 'Work on React.js applications with modern UI/UX design.',
    requirements: ['React.js', 'JavaScript', 'Tailwind CSS'],
    techStack: ['React', 'JavaScript', 'CSS'],
    salary: 'PKR 25,000/month',
    applications: 15,
    status: 'active',
    postedAt: '2024-01-15'
  },
  {
    id: 2,
    title: 'Backend Developer Intern',
    company: 'DataCorp Solutions',
    companyId: 2,
    location: 'Lahore',
    type: 'On-site',
    duration: '4 months',
    startDate: '2024-07-01',
    endDate: '2024-10-31',
    deadline: '2024-06-15',
    paid: true,
    description: 'Develop APIs and work with databases using Node.js and MongoDB.',
    requirements: ['Node.js', 'MongoDB', 'Express.js'],
    techStack: ['Node.js', 'MongoDB', 'Express'],
    salary: 'PKR 30,000/month',
    applications: 8,
    status: 'active',
    postedAt: '2024-01-20'
  },
  {
    id: 3,
    title: 'UI/UX Design Intern',
    company: 'Creative Agency',
    companyId: 2,
    location: 'Karachi',
    type: 'Hybrid',
    duration: '2 months',
    startDate: '2024-06-15',
    endDate: '2024-08-15',
    deadline: '2024-05-30',
    paid: false,
    description: 'Design user interfaces and improve user experience for web applications.',
    requirements: ['Figma', 'Adobe XD', 'Prototyping'],
    techStack: ['Figma', 'Adobe Creative Suite', 'Sketch'],
    salary: 'Unpaid',
    applications: 12,
    status: 'active',
    postedAt: '2024-02-01'
  }
];

export const mockApplications = [
  {
    id: 1,
    jobId: 1,
    studentId: 1,
    studentName: 'Ahmad Ali',
    studentEmail: 'student@comsats.edu.pk',
    appliedAt: '2024-01-16',
    status: 'pending',
    supervisorId: 4,
    supervisorApprovalStatus: 'pending',
    coverLetter: 'I am very interested in this position...',
    resume: 'resume.pdf'
  }
];

export const mockReports = [
  {
    id: 1,
    studentId: 1,
    type: 'weekly',
    weekNumber: 1,
    title: 'Week 1 Progress Report',
    tasksCompleted: 'Completed onboarding and initial setup',
    challenges: 'Getting familiar with the codebase',
    nextWeekPlan: 'Start working on assigned tickets',
    submittedAt: '2024-06-07',
    status: 'submitted'
  },
  {
    id: 2,
    studentId: 1,
    type: 'joining',
    title: 'Joining Report',
    organization: 'Tech Solutions Ltd',
    startDate: '2024-06-01',
    supervisor: 'Eng. Hassan Ali',
    supervisorEmail: 'hassan@techsolutions.com',
    submittedAt: '2024-06-02',
    status: 'submitted'
  }
];

export const mockTimeline = {
  applicationDeadline: '2024-05-15',
  internshipStart: '2024-06-01',
  internshipEnd: '2024-08-31',
  reportDeadlines: {
    joining: '2024-06-07',
    weekly: 'Every Friday',
    final: '2024-09-07'
  }
};

export const mockSupervisors = [
  {
    id: 1,
    name: 'Dr. Muhammad Hassan',
    designation: 'Associate Professor',
    department: 'Software Engineering',
    email: 'hassan@comsats.edu.pk',
    phone: '+92-57-1234568',
    office: 'Block B, Room 305',
    officeHours: 'Mon-Fri 10:00 AM - 12:00 PM',
    expertise: ['Software Engineering', 'Web Development', 'Database Systems'],
    assignedStudents: [1],
    maxStudents: 5
  },
  {
    id: 2,
    name: 'Dr. Fatima Ahmed',
    designation: 'Assistant Professor',
    department: 'Computer Science',
    email: 'fatima@comsats.edu.pk',
    phone: '+92-57-1234569',
    office: 'Block A, Room 210',
    officeHours: 'Tue-Thu 2:00 PM - 4:00 PM',
    expertise: ['Machine Learning', 'Data Science', 'AI'],
    assignedStudents: [],
    maxStudents: 4
  },
  {
    id: 3,
    name: 'Eng. Ali Raza',
    designation: 'Lecturer',
    department: 'Software Engineering',
    email: 'ali@comsats.edu.pk',
    phone: '+92-57-1234570',
    office: 'Block B, Room 208',
    officeHours: 'Mon-Wed 11:00 AM - 1:00 PM',
    expertise: ['Mobile Development', 'React Native', 'Flutter'],
    assignedStudents: [],
    maxStudents: 3
  }
];

export const mockSupervisionRequests = [
  {
    id: 1,
    studentId: 1,
    studentName: 'Ahmad Ali',
    supervisorId: 1,
    jobId: 1,
    jobTitle: 'Frontend Developer Intern',
    company: 'Tech Solutions Ltd',
    requestedAt: '2024-01-16',
    status: 'pending',
    message: 'I would like you to supervise my internship at Tech Solutions Ltd.'
  }
];

export const mockEvaluations = [
  {
    id: 1,
    studentId: 1,
    studentName: 'Ahmad Ali',
    supervisorId: 1,
    weeklyReports: 18,
    internshipReport: 17,
    presentation: 42,
    supervisorAssessment: 9,
    totalMarks: 86,
    grade: 'A',
    submittedAt: '2024-08-30',
    status: 'completed'
  }
];

export const mockMessages = [
  {
    id: 1,
    from: 'supervisor',
    to: 'student',
    fromId: 1,
    toId: 1,
    subject: 'Weekly Report Feedback',
    message: 'Good progress this week. Keep up the good work!',
    sentAt: '2024-06-08',
    read: false
  }
];

export const mockUndertakings = [
  {
    id: 1,
    studentId: 1,
    studentName: 'Ahmad Ali',
    parentName: 'Mr. Ali Ahmad',
    relationship: 'Father',
    phone: '+92-300-1234567',
    submittedAt: '2024-05-10',
    status: 'approved',
    document: 'undertaking_ahmad_ali.pdf'
  }
];