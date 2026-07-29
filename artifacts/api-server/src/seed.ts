import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  db,
  admins,
  homepageContent,
  aboutContent,
  services,
  industries,
  researchAreas,
  publications,
  softwareItems,
  trainingTypes,
  trainingPrograms,
  events,
  siteSettings,
  contactInfo,
  donations,
  jobPositions
} from "@workspace/db";

async function main() {
  console.log("Starting database seeding...");

  try {
    // 1. Seed Admin
    console.log("Seeding admin...");
    const passwordHash = await bcrypt.hash("Admin@123", 12);
    await db.insert(admins).values({
      email: "admin@sustainpro.com",
      passwordHash,
      name: "SustainPro Admin",
      role: "admin",
      mustChangePassword: true,
    }).onConflictDoNothing();

    // 2. Seed Site Settings
    console.log("Seeding site settings...");
    await db.insert(siteSettings).values({
      id: 1,
      siteName: "SustainPro",
      logoUrl: "/logo.jpeg",
      faviconUrl: "/favicon.ico",
      seoTitle: "SustainPro Process Solutions",
      seoDescription: "Engineering a Greener Tomorrow. Global engineering consultancy specializing in chemical engineering, process optimization, and sustainable industrial innovation.",
      socialLinks: {
        "linkedin": "https://linkedin.com/company/sustainpro"
      },
    }).onConflictDoNothing();

    // 3. Seed Contact Info
    console.log("Seeding contact info...");
    await db.insert(contactInfo).values({
      id: 1,
      address: "100 Innovation Drive\nIndustrial Park, Tech City 10001",
      phone: "8735045762",
      email: "sustain.process@gmail.com",
      googleMapsLink: "",
      officeHours: "Monday - Friday: 9:00 AM - 6:00 PM",
    }).onConflictDoNothing();

    // 3b. One-time data fix: migrate legacy placeholder contact values in an
    // existing dev DB to the canonical ones, without clobbering admin edits.
    const [existingContact] = await db.select().from(contactInfo).limit(1);
    if (existingContact) {
      const contactFix: { phone?: string; email?: string } = {};
      if (existingContact.phone === "+91 98765 43210") {
        contactFix.phone = "8735045762";
      }
      if (existingContact.email === "contact@sustainpro.com") {
        contactFix.email = "sustain.process@gmail.com";
      }
      if (Object.keys(contactFix).length > 0) {
        await db
          .update(contactInfo)
          .set({ ...contactFix, updatedAt: new Date().toISOString() })
          .where(eq(contactInfo.id, existingContact.id));
        if (contactFix.phone) {
          console.log("Fixed legacy contact phone -> 8735045762");
        }
        if (contactFix.email) {
          console.log("Fixed legacy contact email -> sustain.process@gmail.com");
        }
      }
    }

    // 4. Seed Donations Block
    console.log("Seeding donations...");
    await db.insert(donations).values({
      id: 1,
      bankName: "State Bank of India",
      accountHolder: "SustainPro Process Solutions",
      accountNumber: "12345678901",
      ifscCode: "SBIN0001234",
      upiId: "sustainpro@sbi",
      qrCodeUrl: "",
    }).onConflictDoNothing();

    // 5. Seed Homepage Content
    console.log("Seeding homepage content...");
    await db.insert(homepageContent).values({
      id: 1,
      heroBadge: "Engineering a Greener Tomorrow",
      heroTitle: "Advanced Process Optimization & Sustainable Solutions",
      heroSubtitle: "Global engineering consultancy specializing in chemical engineering, advanced modeling, and sustainable industrial innovation.",
      heroBgImage: "/hero-bg.png",
      stats: [
        { "value": "10+", "label": "Global Projects" },
        { "value": "50%", "label": "Efficiency" },
        { "value": "100%", "label": "Sustainable Focus" }
      ],
      servicesTitle: "Comprehensive Engineering Solutions",
      servicesSubtitle: "We deliver end-to-end technical excellence across the entire chemical and process engineering lifecycle.",
      sustainabilityTitle: "Pioneering the Transition to Efficient and Sustainable Solutions",
      sustainabilityText: "At SustainPro Process Solutions LLP, we partner with chemical, petrochemical, pharmaceutical, and biochemical industries to design smarter, optimize existing processes, and implement sustainable engineering solutions. Our expertise combines process engineering, simulation, and data-driven optimization to improve productivity, reduce resource and energy consumption, and enhance environmental performance. We are committed to helping organizations achieve operational excellence while building a more sustainable future.",
      sustainabilityItems: [
        "Engineering Solutions",
        "Process Excellence",
        "Sustainability",
        "Training and Consulting"
      ],
      ctaTitle: "Ready to Optimize Your Operations?",
      ctaSubtitle: "Partner with our world-class engineering team to drive efficiency, sustainability, and innovation in your facility.",
    }).onConflictDoNothing();

    // 5b. Seed Training Programs
    console.log("Seeding training programs...");
    const existingPrograms = await db.select().from(trainingPrograms).limit(1);
    if (existingPrograms.length === 0) {
      await db.insert(trainingPrograms).values([
        {
          name: "Process Simulation with Aspen Plus",
          description:
            "Hands-on training covering steady-state simulation, property methods, and flowsheet convergence for practising engineers.",
          duration: "6 weeks",
          eligibility: "B.E. / B.Tech in Chemical Engineering or equivalent",
          mode: "Online",
          startDate: "",
          registrationUrl: "https://sustainpro.example.com/register/aspen-plus",
          coverImage: "",
          order: 1,
          isActive: true,
        },
        {
          name: "Energy Efficiency & Pinch Analysis",
          description:
            "Identify and quantify energy-saving opportunities across heat exchanger networks using pinch technology.",
          duration: "4 weeks",
          eligibility: "Practising process and utility engineers",
          mode: "Hybrid",
          startDate: "",
          registrationUrl: "https://sustainpro.example.com/register/pinch-analysis",
          coverImage: "",
          order: 2,
          isActive: true,
        },
        {
          name: "Industrial Safety & HAZOP Fundamentals",
          description:
            "Structured introduction to hazard identification, HAZOP methodology, and risk ranking for plant teams.",
          duration: "2 weeks",
          eligibility: "",
          mode: "Offline",
          startDate: "",
          registrationUrl: "https://sustainpro.example.com/register/hazop",
          coverImage: "",
          order: 3,
          isActive: true,
        },
      ]);
    }

    // 6. Seed About Page Content
    console.log("Seeding about page content...");
    const defaultAdvisors = [
      {
        name: "Dr. Sridhar Dalai",
        title: "Associate Professor",
        institution: "School of Engineering and Applied Science, Ahmedabad University",
        photoUrl: "/sridhar_dalai.png",
        bio: "Specializes in chemical reaction engineering, catalysis, process design, and sustainability. Dr. Dalai has extensive expertise in modeling and optimizing industrial chemical processes.",
        link: "https://ahduni.edu.in/faculty/sridhar-dalai/"
      },
      {
        name: "Dr. Dharamashi Rabari",
        title: "Associate Professor",
        institution: "School of Engineering and Applied Science, Ahmedabad University",
        photoUrl: "/dharamashi_rabari.png",
        bio: "Focuses on heat transfer, energy systems, process intensification, and green separations. He specializes in designing energy-efficient separation processes and sustainable technology.",
        link: "https://ahduni.edu.in/academics/schools-centres/school-of-engineering-and-applied-science/people-1/dharamashi-rabari/"
      }
    ];

    await db.insert(aboutContent).values({
      id: 1,
      heroTitle: "About SustainPro",
      heroSubtitle: "Engineering a greener tomorrow through innovative process solutions, technical excellence, and sustainable practices.",
      heroBgImage: "/about-bg.png",
      whoWeAreTitle: "Who We Are",
      whoWeAreText: "SustainPro Process Solutions™ is a premium global engineering consultancy. We specialize in chemical engineering, process optimization, and sustainable industrial innovation. Our team of world-class experts partners with industries to enhance efficiency, reduce environmental impact, and pioneer green technologies.",
      visionTitle: "Our Vision",
      visionText: "To be the global leader in driving the industrial transition towards sustainable and highly optimized processes.",
      missionTitle: "Our Mission",
      missionText: "Delivering unparalleled engineering expertise that maximizes operational efficiency while minimizing environmental footprint.",
      valuesTitle: "Core Values",
      valuesText: "Integrity, innovation, sustainability, and technical excellence form the foundation of every project we undertake.",
      leadershipTitle: "Leadership",
      leadershipText: "Guided by industry veterans with decades of combined experience in high-stakes chemical engineering and R&D.",
      advisors: defaultAdvisors,
    }).onConflictDoNothing();

    const [existingAbout] = await db.select().from(aboutContent).limit(1);
    if (existingAbout) {
      if (!existingAbout.advisors || (Array.isArray(existingAbout.advisors) && existingAbout.advisors.length === 0)) {
        await db.update(aboutContent)
          .set({
            advisors: defaultAdvisors,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(aboutContent.id, existingAbout.id));
        console.log("Fixed missing/empty advisors field in existing aboutContent.");
      }
    }

    // 7. Seed Services
    console.log("Seeding services...");
    const existingServices = await db.select().from(services).limit(1);
    if (existingServices.length === 0) {
      await db.insert(services).values([
        {
          title: "Process Engineering & Design",
          description: "Comprehensive process engineering from concept to execution.",
          icon: "Settings",
          details: ["Process flow diagrams (PFD)", "Design calculations", "Equipment sizing", "Process intensification"],
          order: 1,
        },
        {
          title: "Modeling & Simulation",
          description: "Advanced digital representations of physical processes.",
          icon: "BarChart",
          details: ["Aspen Plus / HYSYS", "CFD modeling", "Digital process engineering", "Optimization studies"],
          order: 2,
        },
        {
          title: "Optimization & Troubleshooting",
          description: "Maximizing yield and resolving operational bottlenecks.",
          icon: "Zap",
          details: ["Plant performance analysis", "Bottleneck identification", "Energy optimization", "Operational troubleshooting"],
          order: 3,
        },
        {
          title: "Sustainability & Green Engineering",
          description: "Engineering solutions for a circular economy.",
          icon: "Leaf",
          details: ["Green chemistry", "Circular economy integration", "Carbon capture & utilization", "Sustainable process development"],
          order: 4,
        },
        {
          title: "Industrial R&D & Tech Evaluation",
          description: "Bridging the gap between research and industrial application.",
          icon: "TestTube",
          details: ["Feasibility studies", "Technology assessment", "Pilot-scale development", "Innovation support"],
          order: 5,
        },
        {
          title: "Training & Professional Development",
          description: "Empowering the next generation of engineers.",
          icon: "GraduationCap",
          details: ["Industrial workshops", "Faculty development programs", "Technical training", "Skill enhancement"],
          order: 6,
        },
      ]);
    }

    // 8. Seed Industries
    console.log("Seeding industries...");
    const existingIndustries = await db.select().from(industries).limit(1);
    if (existingIndustries.length === 0) {
      await db.insert(industries).values([
        { name: "Chemical", icon: "Factory", description: "Process design and optimization for bulk chemical manufacturing.", order: 1 },
        { name: "Petrochemical", icon: "Droplet", description: "Advanced simulations and efficiency improvements for downstream processing.", order: 2 },
        { name: "Pharmaceutical", icon: "Pill", description: "Precision engineering for API manufacturing and scalable production.", order: 3 },
        { name: "Energy Sector", icon: "Zap", description: "Transitioning traditional energy into sustainable, lower-carbon models.", order: 4 },
        { name: "Specialty Chemicals", icon: "Beaker", description: "Customized process solutions for complex, high-value chemical products.", order: 5 },
        { name: "Environmental Engineering", icon: "Recycle", description: "Waste reduction, circular economy workflows, and emission control.", order: 6 },
        { name: "Research & Academic", icon: "GraduationCap", description: "Collaborations on cutting-edge process innovations and tech transfer.", order: 7 },
      ]);
    }

    // 9. Seed Research Focus Areas & Publications
    console.log("Seeding research...");
    const existingAreas = await db.select().from(researchAreas).limit(1);
    if (existingAreas.length === 0) {
      await db.insert(researchAreas).values([
        { title: "Green solvents & Deep Eutectic Solvents (DES)", order: 1 },
        { title: "Carbon capture & utilization", order: 2 },
        { title: "Sustainable process design", order: 3 },
        { title: "Industrial R&D partnerships", order: 4 },
        { title: "Publications & patents", order: 5 },
      ]);
    }

    const existingPubs = await db.select().from(publications).limit(1);
    if (existingPubs.length === 0) {
      await db.insert(publications).values([
        { title: "Sustainable Optimization of Chemical Processes Vol 1", authors: "Dr. A. Sharma, Dr. B. Patel", journal: "Journal of Green Engineering", year: 2024, order: 1 },
        { title: "Sustainable Optimization of Chemical Processes Vol 2", authors: "Dr. A. Sharma, Prof. C. Mehta", journal: "Journal of Green Engineering", year: 2024, order: 2 },
        { title: "Sustainable Optimization of Chemical Processes Vol 3", authors: "Dr. B. Patel, Dr. D. Desai", journal: "Journal of Green Engineering", year: 2024, order: 3 },
      ]);
    }

    // 10. Seed Software
    console.log("Seeding software...");
    const existingSoftware = await db.select().from(softwareItems).limit(1);
    if (existingSoftware.length === 0) {
      await db.insert(softwareItems).values([
        { title: "Process Simulation Tools", description: "Expert integration of Aspen Plus, HYSYS, and advanced thermodynamic models.", icon: "MonitorPlay", order: 1 },
        { title: "Digital Platforms", description: "Custom dashboards and real-time monitoring interfaces for plant operations.", icon: "Cpu", order: 2 },
        { title: "Interactive Previews", description: "3D facility rendering and CFD result visualization for better decision making.", icon: "BoxSelect", order: 3 },
      ]);
    }

    // 11. Seed Training Programs
    console.log("Seeding training types...");
    const existingTraining = await db.select().from(trainingTypes).limit(1);
    if (existingTraining.length === 0) {
      await db.insert(trainingTypes).values([
        { title: "Industrial Workshops", description: "Hands-on training for plant engineers focusing on practical troubleshooting and efficiency.", icon: "Briefcase", order: 1 },
        { title: "Faculty Development", description: "Programs designed to bridge the gap between academic curriculum and industrial realities.", icon: "Users", order: 2 },
        { title: "Technical Seminars", description: "Focused deep-dives into specific topics like carbon capture and thermodynamic modeling.", icon: "Calendar", order: 3 },
      ]);
    }

    // 12. Seed Events
    console.log("Seeding events...");
    const existingEvents = await db.select().from(events).limit(1);
    if (existingEvents.length === 0) {
      await db.insert(events).values([
        { title: "Advanced Process Simulation Workshop", date: "Oct 15, 2024", type: "Industrial Workshop", venue: "Seminar Hall A / Online", order: 1 },
        { title: "Green Chemistry Integration in Manufacturing", date: "Nov 02, 2024", type: "Faculty Development", venue: "Research Lab B", order: 2 },
        { title: "Energy Optimization Masterclass", date: "Dec 10, 2024", type: "Technical Training", venue: "Main Auditorium / Zoom", order: 3 },
      ]);
    }

    // 13. Seed Job Positions (Careers)
    console.log("Seeding job positions...");
    const existingPositions = await db.select().from(jobPositions).limit(1);
    if (existingPositions.length === 0) {
      await db.insert(jobPositions).values([
        { title: "Software Engineer", isOpen: false, order: 1 },
        { title: "Flutter Developer", isOpen: false, order: 2 },
        { title: "Backend Developer", isOpen: false, order: 3 },
        { title: "AI/ML Engineer", isOpen: false, order: 4 },
        { title: "Marketing", isOpen: false, order: 5 },
        { title: "HR", isOpen: false, order: 6 },
        { title: "Sales", isOpen: false, order: 7 },
        { title: "UI/UX Designer", isOpen: false, order: 8 },
        { title: "Intern", isOpen: false, order: 9 },
      ]);
    }

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
