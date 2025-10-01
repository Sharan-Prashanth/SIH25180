import { useState, useEffect } from "react";
import { useAuth, ROLES } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import Link from "next/link";

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
        let endpoint = "http://localhost:5000/api/proposals";
        
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
          setProposals(Array.isArray(data.proposals) ? data.proposals : []);
        } else {
          console.log("API failed, using fallback data");
          // Enhanced fallback mock data based on role
          if (isReviewer()) {
            setProposals([
              { 
                id: 1, 
                title: "AI-Powered Medical Diagnosis System", 
                description: "Development of AI system for medical diagnosis using machine learning and computer vision.",
                status: "under_review", 
                author: "John Doe", 
                domain: "Artificial Intelligence",
                budget: 150000,
                createdAt: "2025-09-20T10:00:00Z",
                assignedStaff: null 
              },
              { 
                id: 2, 
                title: "Sustainable Energy Storage Solutions", 
                description: "Research on next-generation battery technology for renewable energy storage.",
                status: "assigned_to_staff", 
                author: "Jane Smith", 
                domain: "Energy Technology",
                budget: 200000,
                createdAt: "2025-09-19T14:30:00Z",
                assignedStaff: "Staff Member 1" 
              },
              { 
                id: 3, 
                title: "Quantum Computing Algorithms", 
                description: "Development of efficient algorithms for quantum computing applications.",
                status: "approved", 
                author: "Bob Wilson", 
                domain: "Quantum Computing",
                budget: 300000,
                createdAt: "2025-09-18T09:15:00Z",
                assignedStaff: "Staff Member 2" 
              }
            ]);
          } else if (isStaff()) {
            setProposals([
              { 
                id: 2, 
                title: "Sustainable Energy Storage Solutions", 
                description: "Research on next-generation battery technology for renewable energy storage.",
                status: "assigned_to_staff", 
                author: "Jane Smith", 
                domain: "Energy Technology",
                budget: 200000,
                createdAt: "2025-09-19T14:30:00Z",
                reviewer: "Dr. Sarah Reviewer" 
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
      const response = await fetch(`http://localhost:5000/api/proposals/${proposalId}/status`, {
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
      const response = await fetch(`http://localhost:5000/api/proposals/${proposalId}/assign`, {
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
      {/* Distinctive Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-[150px] rounded-xl mb-6">
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
        <div className="relative z-10 px-6 py-8">
          <div className="group">
            <div className="flex items-center mb-5">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-orange-500/25 transition-all duration-500 group-hover:scale-110">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-green-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black mb-1 flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              Proposal Overview
            </h2>
            <p className="text-black text-sm">Filter and manage your research proposals</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/proposal/create">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2 font-medium shadow-md hover:shadow-lg text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
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
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-green-50 text-black hover:bg-green-100 border border-green-200'
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
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-green-200">
        <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="bg-white rounded-xl shadow-lg border border-orange-200 overflow-hidden group hover:shadow-xl transition-all duration-300 relative">
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
          <div className="space-y-4">
            {filteredProposals.map((proposal, index) => (
              <div key={proposal.id || proposal._id} className="group relative overflow-hidden border border-orange-200 rounded-lg p-4 bg-orange-50 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-600/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-black">{proposal.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                          proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          proposal.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                          proposal.status === 'submitted' ? 'bg-orange-100 text-orange-800' :
                          proposal.status === 'draft' ? 'bg-gray-100 text-gray-500' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {proposal.status?.replace('_', ' ')?.toUpperCase() || 'DRAFT'}
                        </span>
                      </div>
                      <p className="text-black text-sm mb-3 leading-relaxed">
                        {proposal.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Info Grid */}
                  <div className="grid md:grid-cols-3 gap-2 mb-3">
                    <div className="bg-white p-2 rounded-lg border border-orange-200">
                      <div className="text-xs text-gray-500 mb-1">Domain</div>
                      <div className="text-sm font-medium text-black">{proposal.domain || 'Not specified'}</div>
                    </div>
                    {proposal.budget && (
                      <div className="bg-white p-2 rounded-lg border border-orange-200">
                        <div className="text-xs text-gray-500 mb-1">Budget</div>
                        <div className="text-sm font-medium text-black">₹{proposal.budget.toLocaleString()}</div>
                      </div>
                    )}
                    {proposal.createdAt && (
                      <div className="bg-white p-2 rounded-lg border border-orange-200">
                        <div className="text-xs text-gray-500 mb-1">Created</div>
                        <div className="text-sm font-medium text-black">{new Date(proposal.createdAt).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-1">
                    <Link href={`/proposal/edit/${proposal.id || proposal._id}`}>
                      <button className="bg-green-600 text-white px-2 py-1.5 rounded-md hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-1 font-medium shadow-sm hover:shadow-md text-xs">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </Link>
                    
                    <Link href={`/proposal/view/${proposal.id || proposal._id}`}>
                      <button className="bg-blue-600 text-white px-2 py-1.5 rounded-md hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-1 font-medium shadow-sm hover:shadow-md text-xs">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </Link>
                    
                    <Link href={`/proposal/collaborate/${proposal.id || proposal._id}`}>
                      <button className="bg-purple-600 text-white px-2 py-1.5 rounded-md hover:bg-purple-700 transition-all duration-300 flex items-center justify-center gap-1 font-medium shadow-sm hover:shadow-md text-xs">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Collaborate
                      </button>
                    </Link>
                    
                    <Link href={`/proposal/track/${proposal.id || proposal._id}`}>
                      <button className="bg-orange-600 text-white px-2 py-1.5 rounded-md hover:bg-orange-700 transition-all duration-300 flex items-center justify-center gap-1 font-medium shadow-sm hover:shadow-md text-xs">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Track
                      </button>
                    </Link>
                  </div>
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
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{proposal.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{proposal.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                        <div className="space-y-1">
                          <span className="text-gray-700">
                            <strong>Author:</strong> {proposal.author}
                          </span>
                          <br />
                          <span className="text-gray-700">
                            <strong>Domain:</strong> {proposal.domain}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {proposal.budget && (
                            <>
                              <span className="text-gray-700">
                                <strong>Budget:</strong> ₹{proposal.budget.toLocaleString()}
                              </span>
                              <br />
                            </>
                          )}
                          {proposal.createdAt && (
                            <span className="text-gray-700">
                              <strong>Submitted:</strong> {new Date(proposal.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
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
                        'bg-gray-100 text-gray-800'
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
                    
                    <Link href={`/proposal/collaborate/${proposal.id || proposal._id}`}>
                      <button className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                        <svg className="w-4 h-4 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Collaborate
                      </button>
                    </Link>
                    
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
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {isUser() && renderUserDashboard()}
          {isReviewer() && renderReviewerDashboard()}
          {isStaff() && renderStaffDashboard()}
        </div>
      </main>
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
