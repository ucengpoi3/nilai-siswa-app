import React, { useState } from 'react';
import { Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { pb, isErrorResponse } from '../lib/pb';
import toast from 'react-hot-toast';
import { EditModal } from './EditModal';

export type Assessment = {
  id: string;
  name: string;
  class: string;
  type: string;
  score: number;
};

type AssessmentListProps = {
  assessments: Assessment[];
  onDelete: () => void;
  error?: string;
};

const ITEMS_PER_PAGE = 30;

export function AssessmentList({ assessments, onDelete, error }: AssessmentListProps) {
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAssessments = assessments.filter(assessment =>
    assessment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAssessments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAssessments = filteredAssessments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleDelete = async (id: string) => {
    if (!pb.authStore.isValid) {
      toast.error('Authentication required. Please log in.');
      return;
    }

    if (confirm('Are you sure you want to delete this assessment?')) {
      try {
        await pb.collection('nilai').delete(id);
        toast.success('Assessment deleted successfully');
        onDelete();
      } catch (error: any) {
        if (isErrorResponse(error)) {
          toast.error('Authentication required. Please log in.');
        } else {
          toast.error('Failed to delete assessment');
        }
        console.error('Delete error:', error);
      }
    }
  };

  const handleEdit = async (updatedData: Partial<Assessment>) => {
    if (!editingAssessment || !pb.authStore.isValid) {
      toast.error('Authentication required. Please log in.');
      return;
    }

    try {
      await pb.collection('nilai').update(editingAssessment.id, updatedData);
      toast.success('Assessment updated successfully');
      onDelete(); // Refresh the list
    } catch (error: any) {
      if (isErrorResponse(error)) {
        toast.error('Authentication required. Please log in.');
      } else {
        toast.error('Failed to update assessment');
      }
      console.error('Update error:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            placeholder="Search by student name..."
            className="pl-10 pr-4 py-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAssessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{assessment.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{assessment.class}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${assessment.type === 'Quiz' ? 'bg-purple-100 text-purple-800' :
                      assessment.type === 'Homework' ? 'bg-green-100 text-green-800' :
                      assessment.type === 'Exam' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'}`}>
                    {assessment.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`font-medium ${
                    assessment.score >= 80 ? 'text-green-600' :
                    assessment.score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {assessment.score}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setEditingAssessment(assessment)}
                    className="text-blue-600 hover:text-blue-900"
                    disabled={!pb.authStore.isValid}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(assessment.id)}
                    className="text-red-600 hover:text-red-900 ml-4"
                    disabled={!pb.authStore.isValid}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(startIndex + ITEMS_PER_PAGE, filteredAssessments.length)}
                </span>{' '}
                of <span className="font-medium">{filteredAssessments.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      page === currentPage
                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {editingAssessment && (
        <EditModal
          assessment={editingAssessment}
          onClose={() => setEditingAssessment(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}