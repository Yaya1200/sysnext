export const heroSlides = [
  {
    title: "Doing with Excellence.",
    subtitle:
      "To define quality, cultivate unrivaled customer loyalty, and provide comprehensive solutions to customers' demands.",
    image: "/images/hero/hero1.webp",
  },
  {
    title: "Technology Built for Growth.",
    subtitle:
      "Secure networks, smarter systems, and reliable support that keep organizations moving forward.",
    image: "/images/hero/hero2.webp",
  },
  {
    title: "Your Trusted IT Partner.",
    subtitle:
      "From design to deployment, we help businesses and institutions build resilient digital infrastructure.",
    image: "/images/hero/hero3.webp",
  },
];

export const services = [
  {
    slug: "computing",
    name: "Computing",
    title: "Computing",
    shortDescription:
      "Robust computing infrastructure and dependable support for organizations that depend on reliable digital operations.",
    description:
      "Computing is an advanced IT service offered by SysNet Technologies. Our customers for this kind of service are typically factories and international NGOs, organizations that require dependable, professionally managed computing infrastructure to support their operations.",
    features: [
      "Server installation and configuration",
      "Datacenter facilities",
      "System maintenance and support",
    ],
    image: "/images/services/service1.jpg",
  },
  {
    slug: "solutions",
    name: "Solutions",
    title: "Solutions",
    shortDescription:
      "Tailor-made technology solutions that simplify workflows, increase productivity, and support business growth.",
    description:
      "Solutions is a customized technology service designed to improve efficiency, productivity, and overall business performance for our clients. We deliver practical and scalable systems for organizations looking to streamline operations and improve service delivery.",
    features: [
      "Custom software and systems integration",
      "Business process automation",
      "Technology needs assessment and planning",
    ],
    image: "/images/services/service2.jpg",
  },
  {
    slug: "network-and-security",
    name: "Network & Security",
    title: "Computer Networking and Security",
    shortDescription:
      "Secure, scalable networking and protection strategies designed to keep critical systems stable and resilient.",
    description:
      "Computer Networking and Security focuses on designing, installing, managing, and protecting computer networks to ensure reliable communication and data security. We support businesses and institutions with secure and high-performing infrastructure.",
    features: [
      "Network design and installation",
      "Firewall and cybersecurity setup",
      "Network monitoring and maintenance",
      "Data security and protection",
    ],
    image: "/images/services/service3.jpg",
  },
  {
    slug: "sales",
    name: "Sales",
    title: "Sales",
    shortDescription:
      "Access to trusted hardware, software, and IT products that match your operational and budget requirements.",
    description:
      "Sales provides technology products, devices, and software solutions to meet customer requirements. We supply reliable hardware, networking equipment, and software for business and institutional use.",
    features: [
      "Computers and office equipment",
      "Networking hardware and cabling",
      "Licensed software solutions",
    ],
    image: "/images/services/service4.jpg",
  },
  {
    slug: "consultancy",
    name: "Consultancy",
    title: "Consultancy",
    shortDescription:
      "Strategic guidance to help businesses plan, invest, and modernize with confidence.",
    description:
      "Consultancy provides professional technology advice and guidance to help businesses make better decisions about their IT infrastructure, systems, and digital strategies. We support organizations before they commit to major technology investments.",
    features: [
      "IT infrastructure planning and assessment",
      "Digital transformation strategy",
      "Technology vendor and solution advisory",
    ],
    image: "/images/services/service4.jpg",
  },
];

export const serviceCategories = services.map(({ slug, name }) => ({ slug, name }));

export const projects = [
  {
    title: "Network Installation",
    client: "OLWAY Petroleum",
    description:
      "Network installation covering 80 plus nodes for a reliable and scalable enterprise connectivity solution.",
    image: "/images/projects/project1.png",
  },
  {
    title: "Website Development",
    client: "PMC Ethiopia",
    description:
      "Modern website development tailored to strengthen digital presence and business communication.",
    image: "/images/projects/project2.jpg",
  },
  {
    title: "Network Installation",
    client: "Addis Continental Institute",
    description:
      "Network installation of 560 nodes designed for a large-scale, high-performance institutional infrastructure.",
    image: "/images/projects/project3.jpg",
  },
  {
    title: "Network Installation",
    client: "Enterprise Solutions Ltd",
    description:
      "Network installation of 50 nodes combined with web administration for dependable operational support.",
    image: "/images/projects/project4.jpg",
  },
  {
    title: "Website Development",
    client: "Financial Services Corp",
    description:
      "Website development focused on professional online presence, accessibility, and business growth support.",
    image: "/images/projects/project5.jpg",
  },
];

export const teamMembers = [
  {
    name: "Bereket Kahsay",
    role: "General Manager",
    image: "/images/team/team1.png",
  },
  {
    name: "Frehiwot Endalkachew",
    role: "Co-Founder and Marketing Manager",
    image: "/images/team/team2.jpg",
  },
  {
    name: "Nahom Berhanu",
    role: "Web Developer",
    image: "/images/team/team3.jpg",
  },
  {
    name: "Kirubel E.",
    role: "Support Specialist",
    image: "/images/team/team4.jpg",
  },
];

export const partners = [
  { name: "OLWAY", logo: "/images/partners/partner1.jpg" },
  { name: "PMC", logo: "/images/partners/partner2.jpg" },
  { name: "Addis Continental", logo: "/images/partners/partner3.jpg" },
  { name: "SysNet Client", logo: "/images/partners/partner4.jpg" },
  { name: "Institutional Partner", logo: "/images/partners/partner5.jpg" },
];

export const products = [
  {
    id: 1,
    name: "Networking Cable",
    price: 25.0,
    image: "/products/product1.jpg",
    category: "Networking",
  },
  {
    id: 2,
    name: "Wireless Router",
    price: 80.0,
    image: "/products/product2.jpg",
    category: "Networking",
  },
  {
    id: 3,
    name: "Construction Per Work",
    price: 750.0,
    image: "/products/product3.jpg",
    category: "Computers",
  },
  {
    id: 4,
    name: "Ethernet Switch",
    price: 45.0,
    image: "/products/product5.jpg",
    category: "Networking",
  },
  {
    id: 5,
    name: "Construction Per Work",
    price: 1200.0,
    image: "/products/product6.jpg",
    category: "Computers",
  },
  {
    id: 6,
    name: "Multi Mode FSP",
    price: 180.0,
    image: "/products/product9.jpg",
    category: "Networking",
  },
];

export const stats = [
  { label: "Projects", value: 50 },
  { label: "Clients", value: 30 },
  { label: "Success", value: 5 },
  { label: "Awards", value: 15 },
];
