import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { Lead } from '../types';

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [distributedLeads, setDistributedLeads] = useState<{ [key: string]: Lead[] }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (!['csv', 'xlsx', 'xls'].includes(fileType || '')) {
      toast.error('Please upload a CSV, XLSX, or XLS file');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedLeads: Lead[] = jsonData.map((row: any, index) => ({
          id: `lead-${index}`,
          firstName: row.FirstName || '',
          phone: row.Phone?.toString() || '',
          notes: row.Notes || ''
        }));

        setLeads(parsedLeads);
        distributeLeads(parsedLeads);
        toast.success('File processed successfully');
      } catch (error) {
        toast.error('Error processing file');
        console.error('Error processing file:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      toast.error('Error reading file');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  }, []);

  const distributeLeads = (leads: Lead[]) => {
    const agentCount = 5;
    const distribution: { [key: string]: Lead[] } = {};
    
    for (let i = 1; i <= agentCount; i++) {
      distribution[`Agent ${i}`] = [];
    }

    leads.forEach((lead, index) => {
      const agentIndex = (index % agentCount) + 1;
      distribution[`Agent ${agentIndex}`].push({
        ...lead,
        assignedTo: `Agent ${agentIndex}`
      });
    });

    setDistributedLeads(distribution);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lists Management</h1>
          <p className="text-gray-600">Upload and distribute leads among agents</p>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-indigo-500 bg-indigo-50 scale-102' : 'border-gray-300 hover:border-indigo-400'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className={`mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center
            ${isDragActive ? 'animate-bounce' : ''}`}>
            <Upload className={`h-8 w-8 ${isDragActive ? 'text-indigo-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isProcessing ? 'Processing...' : 'Drop your file here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports CSV, XLSX, or XLS files
            </p>
          </div>
        </div>
      </div>

      {Object.keys(distributedLeads).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="text-xl font-semibold text-white">Lead Distribution</h2>
            <p className="text-indigo-100 mt-1">
              {leads.length} leads distributed among 5 agents
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {Object.entries(distributedLeads).map(([agent, agentLeads]) => (
              <div key={agent} className="px-6 py-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{agent}</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {agentLeads.length} leads
                  </span>
                </div>
                <div className="space-y-3">
                  {agentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <FileSpreadsheet className="h-5 w-5 text-indigo-500 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">{lead.firstName}</p>
                          <p className="text-sm text-gray-600">{lead.phone}</p>
                          {lead.notes && (
                            <p className="text-sm text-gray-500 mt-1">{lead.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {leads.length === 0 && !isProcessing && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leads uploaded</h3>
          <p className="mt-1 text-sm text-gray-500">Upload a file to get started</p>
        </div>
      )}
    </div>
  );
}