import { useState, useEffect } from "react";
import { useAuth, ROLES } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import LoadingScreen from "../components/LoadingScreen";
import Link from "next/link";
import { API_ENDPOINTS, getProposalUrl } from "../utils/api";

// Counter animation component
const AnimatedCounter = ({ targetValue, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(targetValue * easeOutQuart));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetValue, duration]);
  
  return <span>{count}</span>;
};

// Team : ByteSpace 
// SIH Team ID : 72110

function DashboardContent() {
  const { user, logout, isUser, isReviewer, isStaff } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reviewer dashboard state
  const [statusFilter, setStatusFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchProposals = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem("token");
        let endpoint = API_ENDPOINTS.PROPOSALS;
        
        // Different endpoints based on role
        if (isUser()) {
          endpoint += "/my-proposals"; // Only user's own proposals
        } else if (isStaff()) {
          endpoint += "/assigned"; // Only assigned proposals for staff
        }
        // Reviewers get all proposals (default endpoint)

        const response = await fetch(endpoint, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });


        if (response.ok) {
          const data = await response.json();
          console.log(data);
          const proposals = Array.isArray(data.proposals) ? data.proposals : [];
          
          // For reviewers, if no proposals from API, use sample data for demo
          if (isReviewer() && proposals.length === 0) {
            console.log("No proposals from API, using sample data for reviewer");
            setProposals([
              { 
                id: 1, 
                title: "Clean Coal Technology for Reduced Emissions", 
                description: "Development of advanced clean coal technology to minimize environmental impact while maintaining energy efficiency. Focus on carbon capture and storage (CCS) integration.",
                status: "under_review", 
                author: "Dr. Rajesh Kumar", 
                email: "rajesh.kumar@cmpdi.co.in",
                domain: "Clean Coal Technology",
                budget: 2500000,
                duration: "24 months",
                institution: "Central Mine Planning & Design Institute",
                createdAt: "2025-10-01T10:00:00Z",
                submissionDate: "2025-10-01",
                assignedStaff: null,
                priority: "High",
                fundingAgency: "Ministry of Coal",
                collaborators: ["IIT Delhi", "TERI"],
                keywords: ["clean coal", "carbon capture", "emissions reduction"],
                abstract: "This research aims to develop next-generation clean coal technologies that can significantly reduce greenhouse gas emissions while maintaining economic viability of coal-based power generation.",
                expectedOutcomes: ["50% reduction in CO2 emissions", "Improved energy efficiency", "Commercial viability assessment"]
              },
              { 
                id: 2, 
                title: "AI-Based Coal Quality Assessment System", 
                description: "Implementation of artificial intelligence and machine learning algorithms for real-time coal quality assessment and grading in mining operations.",
                status: "assigned_to_staff", 
                author: "Dr. Priya Sharma", 
                email: "priya.sharma@coalindia.in",
                domain: "Digital Mining Technology",
                budget: 1800000,
                duration: "18 months",
                institution: "Coal India Limited R&D Centre",
                createdAt: "2025-09-28T14:30:00Z",
                submissionDate: "2025-09-28",
                assignedStaff: "Mr. Anil Verma",
                priority: "Medium",
                fundingAgency: "Coal India Limited",
                collaborators: ["IIT Kharagpur", "ISM Dhanbad"],
                keywords: ["artificial intelligence", "coal quality", "automated assessment"],
                abstract: "Developing an AI-powered system for automated coal quality assessment using computer vision and machine learning to improve efficiency and accuracy in coal grading processes.",
                expectedOutcomes: ["95% accuracy in quality assessment", "30% reduction in assessment time", "Standardized grading protocol"]
              },
              { 
                id: 3, 
                title: "Sustainable Mining Waste Management", 
                description: "Research on innovative approaches for managing coal mining waste through circular economy principles and environmental restoration techniques.",
                status: "approved", 
                author: "Prof. Vikram Singh", 
                email: "vikram.singh@ismdhanbad.ac.in",
                domain: "Environmental Mining",
                budget: 3200000,
                duration: "36 months",
                institution: "Indian Institute of Technology (ISM) Dhanbad",
                createdAt: "2025-09-25T09:15:00Z",
                submissionDate: "2025-09-25",
                assignedStaff: "Dr. Meera Patel",
                priority: "High",
                fundingAgency: "Department of Science & Technology",
                collaborators: ["CSIR-CIMFR", "NEERI"],
                keywords: ["waste management", "circular economy", "environmental restoration"],
                abstract: "Comprehensive study on converting coal mining waste into useful materials while implementing environmental restoration techniques for sustainable mining practices.",
                expectedOutcomes: ["Zero-waste mining model", "Land restoration protocol", "Commercial waste utilization"]
              },
              { 
                id: 4, 
                title: "Underground Coal Gasification Technology", 
                description: "Advanced research on underground coal gasification (UCG) for clean energy production with minimal surface environmental impact.",
                status: "under_review", 
                author: "Dr. Suresh Reddy", 
                email: "suresh.reddy@ongc.co.in",
                domain: "Advanced Energy Systems",
                budget: 4500000,
                duration: "42 months",
                institution: "Oil and Natural Gas Corporation",
                createdAt: "2025-09-30T16:45:00Z",
                submissionDate: "2025-09-30",
                assignedStaff: null,
                priority: "High",
                fundingAgency: "Ministry of Petroleum & Natural Gas",
                collaborators: ["ONGC Energy Centre", "IIT Bombay"],
                keywords: ["underground gasification", "clean energy", "minimal impact"],
                abstract: "Development of underground coal gasification technology for producing synthetic gas while minimizing surface environmental disruption and maximizing energy recovery.",
                expectedOutcomes: ["Pilot UCG plant", "Environmental impact assessment", "Economic feasibility study"]
              },
              { 
                id: 5, 
                title: "Coal Mine Safety Enhancement using IoT", 
                description: "Implementation of Internet of Things (IoT) sensors and real-time monitoring systems to enhance safety protocols in underground coal mining operations.",
                status: "pending", 
                author: "Engr. Amit Joshi", 
                email: "amit.joshi@secl.co.in",
                domain: "Mining Safety Technology",
                budget: 2100000,
                duration: "30 months",
                institution: "South Eastern Coalfields Limited",
                createdAt: "2025-10-02T11:20:00Z",
                submissionDate: "2025-10-02",
                assignedStaff: null,
                priority: "Medium",
                fundingAgency: "Ministry of Coal",
                collaborators: ["NIT Raipur", "CIMFR"],
                keywords: ["IoT sensors", "mine safety", "real-time monitoring"],
                abstract: "Deployment of comprehensive IoT-based monitoring system for real-time tracking of environmental conditions, equipment status, and personnel safety in underground mines.",
                expectedOutcomes: ["Real-time safety monitoring", "Predictive maintenance system", "Emergency response automation"]
              },
              { 
                id: 6, 
                title: "Coal Bed Methane Extraction Optimization", 
                description: "Research on enhanced coal bed methane (CBM) extraction techniques using advanced drilling technologies and reservoir stimulation methods.",
                status: "rejected", 
                author: "Dr. Kavitha Naidu", 
                email: "kavitha.naidu@ril.com",
                domain: "Reservoir Engineering",
                budget: 3800000,
                duration: "48 months",
                institution: "Reliance Industries Limited",
                createdAt: "2025-09-20T13:30:00Z",
                submissionDate: "2025-09-20",
                assignedStaff: "Dr. Rahul Gupta",
                priority: "Low",
                fundingAgency: "Ministry of Petroleum & Natural Gas",
                collaborators: ["ONGC", "Cairn Energy"],
                keywords: ["coal bed methane", "extraction optimization", "reservoir stimulation"],
                abstract: "Optimization of coal bed methane extraction through advanced horizontal drilling techniques and enhanced reservoir stimulation for increased gas recovery rates.",
                expectedOutcomes: ["Enhanced extraction rates", "Cost reduction strategies", "Environmental impact minimization"],
                rejectionReason: "Insufficient environmental impact assessment and limited innovation over existing methods."
              },
              { 
                id: 7, 
                title: "Renewable Energy Integration in Mining Operations", 
                description: "Development of hybrid renewable energy systems for coal mining operations to reduce carbon footprint and operational costs.",
                status: "under_review", 
                author: "Dr. Sunita Agarwal", 
                email: "sunita.agarwal@ntpc.co.in",
                domain: "Renewable Energy",
                budget: 5200000,
                duration: "60 months",
                institution: "National Thermal Power Corporation",
                createdAt: "2025-09-27T08:45:00Z",
                submissionDate: "2025-09-27",
                assignedStaff: null,
                priority: "High",
                fundingAgency: "Ministry of New & Renewable Energy",
                collaborators: ["NTPC Renewable", "Solar Energy Corporation"],
                keywords: ["renewable energy", "mining operations", "carbon footprint"],
                abstract: "Integration of solar and wind energy systems with existing coal mining infrastructure to create sustainable hybrid energy solutions for mining operations.",
                expectedOutcomes: ["60% renewable energy integration", "Cost reduction analysis", "Replication model development"]
              },
              { 
                id: 8, 
                title: "Advanced Coal Preparation Technologies", 
                description: "Research on innovative coal preparation and beneficiation techniques to improve coal quality and reduce ash content for better combustion efficiency.",
                status: "approved", 
                author: "Prof. Deepak Agrawal", 
                email: "deepak.agrawal@bhu.ac.in",
                domain: "Coal Processing",
                budget: 2800000,
                duration: "36 months",
                institution: "Banaras Hindu University",
                createdAt: "2025-09-22T15:10:00Z",
                submissionDate: "2025-09-22",
                assignedStaff: "Dr. Nisha Kapoor",
                priority: "Medium",
                fundingAgency: "University Grants Commission",
                collaborators: ["CSIR-CIMFR", "BHU Mining Department"],
                keywords: ["coal preparation", "beneficiation", "ash reduction"],
                abstract: "Development of advanced coal preparation technologies using novel separation techniques to produce high-quality coal with reduced ash content and improved calorific value.",
                expectedOutcomes: ["50% ash reduction", "Improved coal quality", "Energy-efficient processing"]
              }
            ]);
          } else {
            setProposals(proposals);
          }
        } else {
          console.log("API failed, using fallback data");
          // Enhanced fallback mock data based on role
          if (isReviewer()) {
            setProposals([
              { 
                id: 1, 
                title: "Clean Coal Technology for Reduced Emissions", 
                description: "Development of advanced clean coal technology to minimize environmental impact while maintaining energy efficiency. Focus on carbon capture and storage (CCS) integration.",
                status: "under_review", 
                author: "Dr. Rajesh Kumar", 
                email: "rajesh.kumar@cmpdi.co.in",
                domain: "Clean Coal Technology",
                budget: 2500000,
                duration: "24 months",
                institution: "Central Mine Planning & Design Institute",
                createdAt: "2025-10-01T10:00:00Z",
                submissionDate: "2025-10-01",
                assignedStaff: null,
                priority: "High",
                fundingAgency: "Ministry of Coal",
                collaborators: ["IIT Delhi", "TERI"],
                keywords: ["clean coal", "carbon capture", "emissions reduction"],
                abstract: "This research aims to develop next-generation clean coal technologies that can significantly reduce greenhouse gas emissions while maintaining economic viability of coal-based power generation.",
                expectedOutcomes: ["50% reduction in CO2 emissions", "Improved energy efficiency", "Commercial viability assessment"]
              },
              { 
                id: 2, 
                title: "AI-Based Coal Quality Assessment System", 
                description: "Implementation of artificial intelligence and machine learning algorithms for real-time coal quality assessment and grading in mining operations.",
                status: "assigned_to_staff", 
                author: "Dr. Priya Sharma", 
                email: "priya.sharma@coalindia.in",
                domain: "Digital Mining Technology",
                budget: 1800000,
                duration: "18 months",
                institution: "Coal India Limited R&D Centre",
                createdAt: "2025-09-28T14:30:00Z",
                submissionDate: "2025-09-28",
                assignedStaff: "Mr. Anil Verma",
                priority: "Medium",
                fundingAgency: "Coal India Limited",
                collaborators: ["IIT Kharagpur", "ISM Dhanbad"],
                keywords: ["artificial intelligence", "coal quality", "automated assessment"],
                abstract: "Developing an AI-powered system for automated coal quality assessment using computer vision and machine learning to improve efficiency and accuracy in coal grading processes.",
                expectedOutcomes: ["95% accuracy in quality assessment", "30% reduction in assessment time", "Standardized grading protocol"]
              },
              { 
                id: 3, 
                title: "Sustainable Mining Waste Management", 
                description: "Research on innovative approaches for managing coal mining waste through circular economy principles and environmental restoration techniques.",
                status: "approved", 
                author: "Prof. Vikram Singh", 
                email: "vikram.singh@ismdhanbad.ac.in",
                domain: "Environmental Mining",
                budget: 3200000,
                duration: "36 months",
                institution: "Indian Institute of Technology (ISM) Dhanbad",
                createdAt: "2025-09-25T09:15:00Z",
                submissionDate: "2025-09-25",
                assignedStaff: "Dr. Meera Patel",
                priority: "High",
                fundingAgency: "Department of Science & Technology",
                collaborators: ["CSIR-CIMFR", "NEERI"],
                keywords: ["waste management", "circular economy", "environmental restoration"],
                abstract: "Comprehensive study on converting coal mining waste into useful materials while implementing environmental restoration techniques for sustainable mining practices.",
                expectedOutcomes: ["Zero-waste mining model", "Land restoration protocol", "Commercial waste utilization"]
              },
              { 
                id: 4, 
                title: "Underground Coal Gasification Technology", 
                description: "Advanced research on underground coal gasification (UCG) for clean energy production with minimal surface environmental impact.",
                status: "under_review", 
                author: "Dr. Suresh Reddy", 
                email: "suresh.reddy@ongc.co.in",
                domain: "Advanced Energy Systems",
                budget: 4500000,
                duration: "42 months",
                institution: "Oil and Natural Gas Corporation",
                createdAt: "2025-09-30T16:45:00Z",
                submissionDate: "2025-09-30",
                assignedStaff: null,
                priority: "High",
                fundingAgency: "Ministry of Petroleum & Natural Gas",
                collaborators: ["ONGC Energy Centre", "IIT Bombay"],
                keywords: ["underground gasification", "clean energy", "minimal impact"],
                abstract: "Development of underground coal gasification technology for producing synthetic gas while minimizing surface environmental disruption and maximizing energy recovery.",
                expectedOutcomes: ["Pilot UCG plant", "Environmental impact assessment", "Economic feasibility study"]
              },
              { 
                id: 5, 
                title: "Coal Mine Safety Enhancement using IoT", 
                description: "Implementation of Internet of Things (IoT) sensors and real-time monitoring systems to enhance safety protocols in underground coal mining operations.",
                status: "pending", 
                author: "Engr. Amit Joshi", 
                email: "amit.joshi@secl.co.in",
                domain: "Mining Safety Technology",
                budget: 2100000,
                duration: "30 months",
                institution: "South Eastern Coalfields Limited",
                createdAt: "2025-10-02T11:20:00Z",
                submissionDate: "2025-10-02",
                assignedStaff: null,
                priority: "Medium",
                fundingAgency: "Ministry of Coal",
                collaborators: ["NIT Raipur", "CIMFR"],
                keywords: ["IoT sensors", "mine safety", "real-time monitoring"],
                abstract: "Deployment of comprehensive IoT-based monitoring system for real-time tracking of environmental conditions, equipment status, and personnel safety in underground mines.",
                expectedOutcomes: ["Real-time safety monitoring", "Predictive maintenance system", "Emergency response automation"]
              },
              { 
                id: 6, 
                title: "Coal Bed Methane Extraction Optimization", 
                description: "Research on enhanced coal bed methane (CBM) extraction techniques using advanced drilling technologies and reservoir stimulation methods.",
                status: "rejected", 
                author: "Dr. Kavitha Naidu", 
                email: "kavitha.naidu@ril.com",
                domain: "Reservoir Engineering",
                budget: 3800000,
                duration: "48 months",
                institution: "Reliance Industries Limited",
                createdAt: "2025-09-20T13:30:00Z",
                submissionDate: "2025-09-20",
                assignedStaff: "Dr. Rahul Gupta",
                priority: "Low",
                fundingAgency: "Ministry of Petroleum & Natural Gas",
                collaborators: ["ONGC", "Cairn Energy"],
                keywords: ["coal bed methane", "extraction optimization", "reservoir stimulation"],
                abstract: "Optimization of coal bed methane extraction through advanced horizontal drilling techniques and enhanced reservoir stimulation for increased gas recovery rates.",
                expectedOutcomes: ["Enhanced extraction rates", "Cost reduction strategies", "Environmental impact minimization"],
                rejectionReason: "Insufficient environmental impact assessment and limited innovation over existing methods."
              },
              { 
                id: 7, 
                title: "Renewable Energy Integration in Mining Operations", 
                description: "Development of hybrid renewable energy systems for coal mining operations to reduce carbon footprint and operational costs.",
                status: "under_review", 
                author: "Dr. Sunita Agarwal", 
                email: "sunita.agarwal@ntpc.co.in",
                domain: "Renewable Energy",
                budget: 5200000,
                duration: "60 months",
                institution: "National Thermal Power Corporation",
                createdAt: "2025-09-27T08:45:00Z",
                submissionDate: "2025-09-27",
                assignedStaff: null,
                priority: "High",
                fundingAgency: "Ministry of New & Renewable Energy",
                collaborators: ["NTPC Renewable", "Solar Energy Corporation"],
                keywords: ["renewable energy", "mining operations", "carbon footprint"],
                abstract: "Integration of solar and wind energy systems with existing coal mining infrastructure to create sustainable hybrid energy solutions for mining operations.",
                expectedOutcomes: ["60% renewable energy integration", "Cost reduction analysis", "Replication model development"]
              },
              { 
                id: 8, 
                title: "Advanced Coal Preparation Technologies", 
                description: "Research on innovative coal preparation and beneficiation techniques to improve coal quality and reduce ash content for better combustion efficiency.",
                status: "approved", 
                author: "Prof. Deepak Agrawal", 
                email: "deepak.agrawal@bhu.ac.in",
                domain: "Coal Processing",
                budget: 2800000,
                duration: "36 months",
                institution: "Banaras Hindu University",
                createdAt: "2025-09-22T15:10:00Z",
                submissionDate: "2025-09-22",
                assignedStaff: "Dr. Nisha Kapoor",
                priority: "Medium",
                fundingAgency: "University Grants Commission",
                collaborators: ["CSIR-CIMFR", "BHU Mining Department"],
                keywords: ["coal preparation", "beneficiation", "ash reduction"],
                abstract: "Development of advanced coal preparation technologies using novel separation techniques to produce high-quality coal with reduced ash content and improved calorific value.",
                expectedOutcomes: ["50% ash reduction", "Improved coal quality", "Energy-efficient processing"]
              }
            ]);
          } else if (isStaff()) {
            setProposals([
              { 
                id: 2, 
                title: "AI-Based Coal Quality Assessment System", 
                description: "Implementation of artificial intelligence and machine learning algorithms for real-time coal quality assessment and grading in mining operations.",
                status: "assigned_to_staff", 
                author: "Dr. Priya Sharma", 
                email: "priya.sharma@coalindia.in",
                domain: "Digital Mining Technology",
                budget: 1800000,
                duration: "18 months",
                institution: "Coal India Limited R&D Centre",
                createdAt: "2025-09-28T14:30:00Z",
                submissionDate: "2025-09-28",
                reviewer: "Dr. Sarah Reviewer",
                priority: "Medium",
                fundingAgency: "Coal India Limited",
                collaborators: ["IIT Kharagpur", "ISM Dhanbad"],
                keywords: ["artificial intelligence", "coal quality", "automated assessment"]
              },
              { 
                id: 3, 
                title: "Sustainable Mining Waste Management", 
                description: "Research on innovative approaches for managing coal mining waste through circular economy principles and environmental restoration techniques.",
                status: "assigned_to_staff", 
                author: "Prof. Vikram Singh", 
                email: "vikram.singh@ismdhanbad.ac.in",
                domain: "Environmental Mining",
                budget: 3200000,
                duration: "36 months",
                institution: "Indian Institute of Technology (ISM) Dhanbad",
                createdAt: "2025-09-25T09:15:00Z",
                submissionDate: "2025-09-25",
                reviewer: "Dr. Environmental Reviewer",
                priority: "High",
                fundingAgency: "Department of Science & Technology",
                collaborators: ["CSIR-CIMFR", "NEERI"],
                keywords: ["waste management", "circular economy", "environmental restoration"]
              }
            ]);
          } else if (isUser()) {
            setProposals([
              { 
                id: 1, 
                title: "AI-Powered Healthcare Diagnosis System", 
                description: "Developing an AI system to assist doctors in medical diagnosis using machine learning algorithms and medical imaging.",
                status: "submitted", 
                domain: "Artificial Intelligence & Healthcare",
                budget: 150000,
                createdAt: "2025-09-20T10:00:00Z",
                feedback: [] 
              }
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching proposals:", error);
        // Set empty array on error
        setProposals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [user, isUser, isReviewer, isStaff]);

  // Handler functions for reviewer actions
  const handleStatusUpdate = async (proposalId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      // For demo purposes with sample data, simulate API call success
      if (!token || proposals.some(p => (p.id || p._id) === proposalId && [1,2,3,4,5,6,7,8].includes(p.id))) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update local state for demo
        setProposals(prevProposals => 
          prevProposals.map(proposal => 
            (proposal.id || proposal._id) === proposalId 
              ? { ...proposal, status: newStatus }
              : proposal
          )
        );
        alert(`Proposal ${newStatus} successfully! (Demo mode)`);
        return;
      }

      // Real API call for actual data
      const response = await fetch(getProposalUrl(proposalId, 'status'), {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setProposals(prevProposals => 
          prevProposals.map(proposal => 
            (proposal.id || proposal._id) === proposalId 
              ? { ...proposal, status: newStatus }
              : proposal
          )
        );
        alert(`Proposal ${newStatus} successfully!`);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update proposal status. Please try again.');
    }
  };

  const handleStaffAssignment = async (proposalId) => {
    const staffMember = prompt('Enter staff member name to assign:');
    if (!staffMember) return;

    try {
      const token = localStorage.getItem("token");
      
      // For demo purposes with sample data, simulate API call success
      if (!token || proposals.some(p => (p.id || p._id) === proposalId && [1,2,3,4,5,6,7,8].includes(p.id))) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update local state for demo
        setProposals(prevProposals => 
          prevProposals.map(proposal => 
            (proposal.id || proposal._id) === proposalId 
              ? { ...proposal, assignedStaff: staffMember, status: 'assigned_to_staff' }
              : proposal
          )
        );
        alert(`Proposal assigned to ${staffMember} successfully! (Demo mode)`);
        return;
      }

      // Real API call for actual data
      const response = await fetch(getProposalUrl(proposalId, 'assign'), {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          assignedStaff: staffMember,
          status: 'assigned_to_staff'
        })
      });

      if (response.ok) {
        // Update local state
        setProposals(prevProposals => 
          prevProposals.map(proposal => 
            (proposal.id || proposal._id) === proposalId 
              ? { ...proposal, assignedStaff: staffMember, status: 'assigned_to_staff' }
              : proposal
          )
        );
        alert(`Proposal assigned to ${staffMember} successfully!`);
      } else {
        throw new Error('Failed to assign staff');
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
      alert('Failed to assign staff. Please try again.');
    }
  };

  const handleSendFeedback = (proposalId) => {
    const feedback = prompt('Enter your feedback for this proposal:');
    if (!feedback) return;

    // For now, just show an alert. In a real app, this would send feedback to the database
    alert(`Feedback sent: "${feedback}"\n\nThis would be saved to the database and the author would be notified.`);
  };

  const renderUserDashboard = () => {
    // Filter proposals for user dashboard
    const filteredProposals = proposals.filter(proposal => {
      if (statusFilter !== 'all' && proposal.status !== statusFilter) return false;
      return true;
    });

    return (
    <div className="space-y-6">

      {/* Quick Actions & Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-orange-200 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black mb-1 flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              Proposal Overview
            </h2>
            <p className="text-gray-500 text-sm">Filter and manage your research proposals</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/proposal/create">
              <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl text-sm transform hover:scale-105">
                <div className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                New Proposal
              </button>
            </Link>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Proposals', count: proposals.length },
            { key: 'draft', label: 'Draft', count: proposals.filter(p => p.status === 'draft').length },
            { key: 'submitted', label: 'Submitted', count: proposals.filter(p => p.status === 'submitted').length },
            { key: 'under_review', label: 'Under Review', count: proposals.filter(p => p.status?.includes('review')).length },
            { key: 'approved', label: 'Approved', count: proposals.filter(p => p.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: proposals.filter(p => p.status === 'rejected').length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                statusFilter === key
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105'
                  : 'bg-orange-50 text-gray-500 hover:bg-orange-100 hover:text-orange-600 hover:shadow-md border border-orange-200'
              }`}
            >
              {label}
              <span className={`px-2 py-1 rounded-full text-xs ${
                statusFilter === key 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Dashboard - Based on Design Image */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-orange-200 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          Research Analytics
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {/* Total Proposals Card */}
          <div className="group relative overflow-hidden border border-orange-200 rounded-lg p-6 bg-orange-50 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-600/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-4xl font-black text-black mb-2">
                <AnimatedCounter targetValue={proposals.length} duration={2000} />
              </div>
              <h3 className="text-sm font-bold text-black mb-3">Total Proposals</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded border border-orange-200">
                  <div className="text-lg font-bold text-black">
                    <AnimatedCounter targetValue={proposals.filter(p => p.status?.includes('review')).length} duration={2500} />
                  </div>
                  <div className="text-xs text-gray-500">Review</div>
                </div>
                <div className="bg-white p-2 rounded border border-orange-200">
                  <div className="text-lg font-bold text-black">
                    <AnimatedCounter targetValue={proposals.filter(p => p.status === 'approved').length} duration={2500} />
                  </div>
                  <div className="text-xs text-gray-500">Approved</div>
                </div>
              </div>
            </div>
          </div>

          {/* Draft Proposals Card */}
          <div className="group relative overflow-hidden border border-orange-200 rounded-lg p-6 bg-orange-50 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-600/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-4xl font-black text-black mb-2">
                <AnimatedCounter targetValue={proposals.filter(p => p.status === 'draft').length} duration={2200} />
              </div>
              <h3 className="text-sm font-bold text-black mb-3">Draft Proposals</h3>
              <p className="text-xs text-gray-500 bg-white p-2 rounded border border-orange-200">
                Continue working on incomplete proposals
              </p>
            </div>
          </div>

          {/* Success Rate Card */}
          <div className="group relative overflow-hidden border border-orange-200 rounded-lg p-6 bg-orange-50 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-600/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-4xl font-black text-black mb-2">
                <AnimatedCounter targetValue={Math.round((proposals.filter(p => p.status === 'approved').length / Math.max(proposals.length, 1)) * 100)} duration={2400} />%
              </div>
              <h3 className="text-sm font-bold text-black mb-3">Success Rate</h3>
              <p className="text-xs text-gray-500 bg-white p-2 rounded border border-orange-200">
                Approval rate of submitted proposals
              </p>
            </div>
          </div>

          {/* Total Budget Card */}
          <div className="group relative overflow-hidden border border-orange-200 rounded-lg p-6 bg-orange-50 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-600/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-3xl font-black text-black mb-2">
                ₹<AnimatedCounter targetValue={proposals.reduce((sum, p) => sum + (p.budget || 0), 0)} duration={2600} />
              </div>
              <h3 className="text-sm font-bold text-black mb-3">Total Budget</h3>
              <p className="text-xs text-gray-500 bg-white p-2 rounded border border-orange-200">
                Combined budget across all proposals
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Proposals Section */}
      <div className="bg-white rounded-xl shadow-lg border border-orange-200 overflow-hidden group hover:shadow-xl transition-all duration-300 relative animate-slideInUp" style={{ animationDelay: '0.6s' }}>
        <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 border-b border-orange-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black mb-1">Research Proposals</h2>
                  <p className="text-gray-500 text-sm">
                    Showing {filteredProposals.length} of {proposals.length} proposals
                    {statusFilter !== 'all' && ` (filtered by ${statusFilter.replace('_', ' ')})`}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500 text-right">
                <div>Government of India</div>
                <div>Ministry of Coal</div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
        
        {filteredProposals.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredProposals.map((proposal, index) => (
              <div key={proposal.id || proposal._id} className="group bg-white rounded-xl border border-orange-200 hover:border-orange-300 p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 animate-slideInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300 group-hover:scale-110">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors duration-300">{proposal.title}</h3>
                      <p className="text-sm text-gray-500">Research Proposal #{(proposal.id || proposal._id).toString().slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      proposal.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                      proposal.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                      proposal.status === 'under_review' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      proposal.status === 'submitted' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      proposal.status === 'draft' ? 'bg-gray-100 text-gray-500 border border-gray-200' :
                      'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {proposal.status?.replace('_', ' ')?.toUpperCase() || 'DRAFT'}
                    </span>
                    
                    {proposal.budget && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Budget</div>
                        <div className="text-sm font-bold text-gray-900">₹{proposal.budget.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-4">
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                    {proposal.description || 'No description available for this research proposal.'}
                  </p>
                </div>
                
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                    <div className="flex items-center space-x-2 mb-1">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-xs font-medium text-orange-600">Domain</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{proposal.domain || 'Not specified'}</div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center space-x-2 mb-1">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6M8 7v6a7 7 0 1014 0V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                      </svg>
                      <span className="text-xs font-medium text-blue-600">Created</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      }) : 'Recently'}
                    </div>
                  </div>
                </div>
                
                {/* Additional Information Grid */}
                {(proposal.institution || proposal.duration || proposal.priority || proposal.fundingAgency) && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {proposal.institution && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-xs font-medium text-purple-600">Institution</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 line-clamp-2">{proposal.institution}</div>
                      </div>
                    )}
                    
                    {proposal.duration && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-medium text-green-600">Duration</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{proposal.duration}</div>
                      </div>
                    )}
                    
                    {proposal.priority && (
                      <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-xs font-medium text-red-600">Priority</span>
                        </div>
                        <div className={`text-sm font-semibold ${
                          proposal.priority === 'High' ? 'text-red-600' :
                          proposal.priority === 'Medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>{proposal.priority}</div>
                      </div>
                    )}
                    
                    {proposal.fundingAgency && (
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-xs font-medium text-indigo-600">Funding Agency</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 line-clamp-2">{proposal.fundingAgency}</div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Collaborators and Keywords */}
                {(proposal.collaborators?.length > 0 || proposal.keywords?.length > 0) && (
                  <div className="mb-4 space-y-3">
                    {proposal.collaborators?.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-xs font-medium text-gray-600">Collaborators</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {proposal.collaborators.slice(0, 3).map((collaborator, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-200">
                              {collaborator}
                            </span>
                          ))}
                          {proposal.collaborators.length > 3 && (
                            <span className="text-xs text-gray-500">+{proposal.collaborators.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {proposal.keywords?.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-xs font-medium text-gray-600">Keywords</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {proposal.keywords.slice(0, 4).map((keyword, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full border border-gray-200">
                              {keyword}
                            </span>
                          ))}
                          {proposal.keywords.length > 4 && (
                            <span className="text-xs text-gray-500">+{proposal.keywords.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Rejection Reason (if applicable) */}
                {proposal.status === 'rejected' && proposal.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-medium text-red-600">Rejection Reason</span>
                    </div>
                    <p className="text-sm text-red-800">{proposal.rejectionReason}</p>
                  </div>
                )}
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Progress</span>
                    <span className="text-xs font-bold text-gray-900">
                      {proposal.status === 'draft' ? '25%' :
                       proposal.status === 'submitted' || proposal.status === 'pending' ? '50%' :
                       proposal.status === 'under_review' || proposal.status === 'assigned_to_staff' ? '75%' :
                       proposal.status === 'approved' ? '100%' :
                       proposal.status === 'rejected' ? '100%' : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-500 ${
                      proposal.status === 'approved' ? 'bg-green-500 w-full' :
                      proposal.status === 'rejected' ? 'bg-red-500 w-full' :
                      proposal.status === 'under_review' || proposal.status === 'assigned_to_staff' ? 'bg-blue-500 w-3/4' :
                      proposal.status === 'submitted' || proposal.status === 'pending' ? 'bg-orange-500 w-1/2' :
                      proposal.status === 'draft' ? 'bg-gray-400 w-1/4' :
                      'bg-gray-300 w-0'
                    }`}></div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Link href={`/proposal/edit/${proposal.id || proposal._id}`}>
                    <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  </Link>
                  
                  <Link href={`/proposal/view/${proposal.id || proposal._id}`}>
                    <button className="bg-white border border-orange-200 hover:border-orange-300 text-orange-600 hover:text-orange-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 hover:bg-orange-50">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  </Link>
                  
                  <Link href={`/proposal/collaborate/${proposal.id || proposal._id}`}>
                    <button className="bg-white border border-blue-200 hover:border-blue-300 text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 hover:bg-blue-50">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Collaborate
                    </button>
                  </Link>
                  
                  <Link href={`/proposal/track/${proposal.id || proposal._id}`}>
                    <button className="bg-white border border-green-200 hover:border-green-300 text-green-600 hover:text-green-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 hover:bg-green-50">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Track
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center border border-slate-200">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">No Research Proposals Found</h3>
            <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto leading-relaxed">
              {statusFilter === 'all' 
                ? "You haven't created any research proposals yet. Start by submitting your first proposal to the Ministry of Coal research initiative."
                : `No proposals found with status "${statusFilter.replace('_', ' ')}". Try selecting a different filter or create a new proposal.`
              }
            </p>
            <div className="space-y-3">
              <Link href="/proposal/create">
                <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Research Proposal
                </button>
              </Link>
              {statusFilter !== 'all' && (
                <button 
                  onClick={() => setStatusFilter('all')}
                  className="block mx-auto text-gray-500 hover:text-black text-sm font-medium"
                >
                  View all proposals
                </button>
              )}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
  };

  const renderReviewerDashboard = () => {
    // Filter and sort proposals
    const filteredProposals = proposals
      .filter(proposal => {
        if (statusFilter !== 'all' && proposal.status !== statusFilter) return false;
        if (domainFilter !== 'all' && proposal.domain !== domainFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'budget-high') return b.budget - a.budget;
        if (sortBy === 'budget-low') return a.budget - b.budget;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });

    // Get unique domains for filter
    const uniqueDomains = [...new Set(proposals.map(p => p.domain).filter(Boolean))];

    return (
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="relative bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 text-white p-6 rounded-xl shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-indigo-900/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Research Proposal Review System</h1>
                <p className="text-blue-100">Expert Review Panel | Evaluate and manage research proposals across all domains</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-200">Government of India</div>
                <div className="text-xs text-blue-300">Ministry of Coal - Review Committee</div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Statistics & Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-black mb-1">Review Management Panel</h2>
                <p className="text-gray-500 text-sm">Filter and evaluate research proposals for approval</p>
              </div>
              <div className="text-xs text-gray-500 text-right">
                <div>Review Committee</div>
                <div>NaCCER Initiative</div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Statistics Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-black">{proposals.length}</div>
                    <div className="text-xs text-gray-500">Total Proposals</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-black">{proposals.filter(p => p.status === 'under_review').length}</div>
                    <div className="text-xs text-gray-500">Under Review</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-black">{proposals.filter(p => p.status === 'approved').length}</div>
                    <div className="text-xs text-gray-500">Approved</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-black">{proposals.filter(p => p.status === 'assigned_to_staff').length}</div>
                    <div className="text-xs text-gray-500">Assigned to Staff</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Filter by Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="assigned_to_staff">Assigned to Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Filter by Domain</label>
                <select 
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                >
                  <option value="all">All Domains</option>
                  {uniqueDomains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Sort by</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                >
                  <option value="recent">Most Recent</option>
                  <option value="budget-high">Highest Budget</option>
                  <option value="budget-low">Lowest Budget</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Proposals List */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 animate-fade-in-up animation-delay-1200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Proposals for Review 
                <span className="text-xl font-normal text-slate-600 ml-3">
                  ({filteredProposals.length} of {proposals.length})
                </span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 animate-scale-x"></div>
            </div>
          </div>
          
          {filteredProposals.length > 0 ? (
            <div className="grid gap-8">
              {filteredProposals.map((proposal, index) => (
                <div key={proposal.id || proposal._id} className={`group bg-slate-50 hover:bg-white border border-slate-200 hover:border-purple-200 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 animate-fade-in-up hover:scale-105`} style={{animationDelay: `${1400 + index * 100}ms`}}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-black group-hover:text-black group-hover:font-black transition-colors duration-300">{proposal.title}</h3>
                        <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          ID: {(proposal.id || '').toString().slice(-3).padStart(3, '0')}
                        </span>
                      </div>
                      <p className="text-gray-500 mb-3 line-clamp-2 leading-relaxed">{proposal.description}</p>
                      
                      {/* Enhanced Information Grid */}
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <div>
                              <div className="text-xs text-blue-600 font-medium mb-1">Author</div>
                              <div className="text-gray-900 font-semibold">{proposal.author}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-100">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <div className="flex-1">
                              <div className="text-xs text-green-600 font-medium mb-1">Institution</div>
                              <div className="text-gray-900 font-semibold text-xs leading-tight">{proposal.institution}</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {proposal.budget && (
                            <div className="flex items-center gap-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                              <svg className="w-5 h-5 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <div>
                                <div className="text-xs text-orange-600 font-medium mb-1">Budget</div>
                                <div className="text-gray-900 font-bold text-lg">₹{(proposal.budget / 100000).toFixed(1)} Lakhs</div>
                              </div>
                            </div>
                          )}
                          {proposal.duration && (
                            <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg border border-purple-100">
                              <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <div className="text-xs text-purple-600 font-medium mb-1">Duration</div>
                                <div className="text-gray-900 font-semibold">{proposal.duration}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Domain and Keywords Tags */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-3 mb-3">
                          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-blue-200 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            {proposal.domain}
                          </span>
                          {proposal.priority && (
                            <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 flex items-center gap-2 ${
                              proposal.priority === 'High' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-200' :
                              proposal.priority === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-200' :
                              'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-200'
                            }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {proposal.priority} Priority
                            </span>
                          )}
                        </div>
                        {proposal.keywords && proposal.keywords.length > 0 && (
                          <div className="bg-gray-50 p-3 text-black rounded-lg border border-gray-200">
                            <div className="text-xs text-black font-medium mb-2 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              Research Keywords
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {proposal.keywords.slice(0, 3).map((keyword, idx) => (
                                <span key={idx} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg border border-blue-700 hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center gap-1">
                                  <span className="text-black">#</span>{keyword}
                                </span>
                              ))}
                              {proposal.keywords.length > 3 && (
                                <span className="text-sm text-blue-700 px-4 py-2 font-bold bg-blue-100 rounded-lg border border-blue-300 shadow-md">+{proposal.keywords.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {proposal.assignedStaff && (
                        <div className="bg-green-50 p-3 rounded-lg mb-3">
                          <span className="text-green-800 font-medium">
                            ✅ Assigned to Staff: {proposal.assignedStaff}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block ${
                        proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                        proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        proposal.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                        proposal.status === 'assigned_to_staff' ? 'bg-orange-100 text-orange-800' :
                        proposal.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {proposal.status?.replace('_', ' ')?.toUpperCase() || 'SUBMITTED'}
                      </span>
                      
                      {/* Priority Indicator */}
                      {proposal.budget > 250000 && (
                        <div className="text-xs text-red-600 font-semibold mt-1">
                          🔥 High Budget Priority
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-6 border-t border-slate-200 flex-wrap">
                    <Link href={`/proposal/review/${proposal.id || proposal._id}`}>
                      <button className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                        <svg className="w-4 h-4 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Review Proposal
                      </button>
                    </Link>
                    
                    {proposal.status === 'under_review' && (
                      <button 
                        onClick={() => handleStatusUpdate(proposal.id || proposal._id, 'approved')}
                        className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Approve
                      </button>
                    )}
                    
                    {proposal.status === 'approved' && !proposal.assignedStaff && (
                      <button 
                        onClick={() => handleStaffAssignment(proposal.id || proposal._id)}
                        className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Assign Staff
                      </button>
                    )}
                  
                    
                    <button 
                      onClick={() => handleSendFeedback(proposal.id || proposal._id)}
                      className="group bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Send Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 animate-fade-in-up animation-delay-1400">
              <div className="text-8xl mb-6 animate-bounce-subtle">📋</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-3">No proposals match your filters</h3>
              <p className="text-slate-600 mb-8 text-lg max-w-md mx-auto leading-relaxed">Try adjusting your filter criteria to see more proposals</p>
              <button 
                onClick={() => {
                  setStatusFilter('all');
                  setDomainFilter('all');
                  setSortBy('recent');
                }}
                className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-2xl hover:shadow-3xl text-lg transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 flex items-center gap-3 mx-auto"
              >
                <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStaffDashboard = () => (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="relative bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 text-white p-6 rounded-xl shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-blue-900/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Research Staff Assignment Portal</h1>
              <p className="text-blue-100">Staff Member Dashboard | Manage and report on your assigned research proposals</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">Government of India</div>
              <div className="text-xs text-blue-300">Ministry of Coal - Research Staff</div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Assignment Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-black mb-1">Assigned Research Proposals</h2>
              <p className="text-gray-500 text-sm">Review and submit reports for assigned proposals</p>
            </div>
            <div className="text-xs text-gray-500 text-right">
              <div>Research Staff Portal</div>
              <div>Assignment ID: {user?.id}</div>
            </div>
          </div>
        </div>
        
        {proposals.length > 0 ? (
          <div className="space-y-4">
            {proposals.map((proposal, index) => (
              <div key={proposal.id} className="border border-slate-200 rounded-xl bg-gradient-to-r from-white to-slate-50 hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Proposal Header */}
                <div className="p-6 border-b border-slate-200 bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-black">{proposal.title}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          {proposal.status?.replace('_', ' ')?.toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Staff Assignment Info */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="text-xs text-gray-500 mb-1">Original Author</div>
                          <div className="text-sm font-medium text-black flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {proposal.author}
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="text-xs text-gray-500 mb-1">Assigned by</div>
                          <div className="text-sm font-medium text-black flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {proposal.reviewer}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <div className="flex flex-wrap gap-3">
                    <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Submit Report
                    </button>
                    <Link href={`/proposal/collaborate/${proposal.id}`}>
                      <button className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 hover:from-slate-900 hover:via-blue-900 hover:to-indigo-900 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>
                    </Link>
                    <div className="flex-1"></div>
                    <div className="text-xs text-gray-500 flex items-center">
                      Assignment ID: {proposal.id}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center border border-slate-200">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">No Proposals Assigned</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              You don't have any research proposals assigned to you at the moment. Please check back later for new assignments from the review committee.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Full-width Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-[280px]">
        {/* Animated geometric patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-6 left-10 w-12 h-12 border border-blue-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-10 h-10 border border-indigo-400/20 rounded-lg rotate-45 animate-spin-slow"></div>
          <div className="absolute bottom-12 left-32 w-8 h-8 bg-blue-500/10 rounded-full animate-bounce"></div>
          <div className="absolute top-12 right-40 w-4 h-4 bg-indigo-400/20 rounded-full animate-ping"></div>
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        
        {/* Header Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
          <div className="group">
            <div className="flex items-center mb-5">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-orange-500/25 transition-all duration-500 group-hover:scale-110">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              
              <div className="ml-6">
                <div className="flex items-center mb-2">
                  <h1 className="text-white text-4xl font-black tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Research Dashboard
                  </h1>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse mr-3"></div>
                    <span className="text-blue-100 font-semibold text-lg">Welcome back, {user?.name}</span>
                  </div>
                  <div className="h-4 w-px bg-blue-300/50"></div>
                  <span className="text-blue-200 font-medium text-sm">NaCCER Research Portal</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-blue-200">
                  <span>Active Proposals: {proposals.length}</span>
                  <span>•</span>
                  <span>User ID: {user?.id || 'RSC001'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Research Portal Active
                  </span>
                </div>
              </div>
            </div>
            
            {/* PRISM Banner */}
            <div className="bg-orange-600 backdrop-blur-md rounded-2xl p-4 border border-orange-300/40 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-white to-orange-50 rounded-lg flex items-center justify-center shadow-lg overflow-hidden border border-orange-200/50">
                    <img 
                      src="/images/prism brand logo.png" 
                      alt="PRISM Logo" 
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl mb-1 flex items-center">
                    <span className="text-white drop-shadow-md tracking-wide">PRISM</span>
                    <div className="ml-3 px-2 py-0.5 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full flex items-center justify-center border border-blue-300/40 backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 bg-blue-300 rounded-full mr-1.5 animate-pulse"></div>
                      <span className="text-white text-xs font-semibold drop-shadow-sm">DASHBOARD</span>
                    </div>
                  </h2>
                  <p className="text-orange-50 text-sm leading-relaxed font-medium opacity-95 drop-shadow-sm">
                    Proposal Review & Innovation Support Mechanism for Department of Coal's Advanced Research Platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative">
        {isUser() && renderUserDashboard()}
        {isReviewer() && renderReviewerDashboard()}
        {isStaff() && renderStaffDashboard()}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
