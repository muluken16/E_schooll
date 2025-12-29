import styled from "styled-components";

// Page container
export const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background-color: #f7fafc;
  min-height: 100vh;
`;

// Sections
export const SectionContainer = styled.div`
  background: #fff;
  padding: 25px;
  border-radius: 16px;
  margin-bottom: 25px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.1);
  transition: transform 0.2s;
`;

// Titles
export const SubTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 24px;
    background: #3182ce;
    border-radius: 2px;
  }
`;

// Input & Select fields
export const Input = styled.input`
  border: 1px solid ${props => props.error ? "#e53e3e" : "#e2e8f0"};
  border-radius: 8px;
  padding: 12px 16px;
  width: 100%;
  transition: all 0.2s;
  background: #f8fafc;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
  }
`;

export const Select = styled.select`
  border: 1px solid ${props => props.error ? "#e53e3e" : "#e2e8f0"};
  border-radius: 8px;
  padding: 12px 16px;
  width: 100%;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3182ce;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
  }
`;

// Buttons
export const Button = styled.button`
  background-color: ${props => props.bgColor || "#3182ce"};
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  &:hover {
    background-color: ${props => props.hoverColor || "#2c5282"};
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.12);
  }
  &:active {
    transform: translateY(0px);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

// Dashboard/Stats Grid
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

export const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-left: 5px solid ${props => props.color || "#3182ce"};
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  }

  .content {
    h3 {
      font-size: 13px;
      color: #718096;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .value {
      font-size: 32px;
      font-weight: 800;
      color: #2d3748;
    }
  }

  .icon {
    font-size: 42px;
    opacity: 0.15;
    color: ${props => props.color || "#3182ce"};
  }
`;

// Table
export const TableContainer = styled.div`
  overflow-x: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  
  th:first-child { border-top-left-radius: 12px; }
  th:last-child { border-top-right-radius: 12px; }
`;

export const THead = styled.thead`
  background-color: #f7fafc;
`;

export const TR = styled.tr`
  &:hover {
    background-color: #f8fafc;
    transition: background-color 0.15s ease;
  }
  &:last-child td {
    border-bottom: none;
  }
`;

export const TH = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const TD = styled.td`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #2d3748;
  vertical-align: middle;
  font-size: 14px;
`;

// New Components for Full Functionality
export const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  background-color: ${props => props.status === 'Active' ? '#c6f6d5' : props.status === 'Graduated' ? '#bee3f8' : '#fed7d7'};
  color: ${props => props.status === 'Active' ? '#22543d' : props.status === 'Graduated' ? '#2a4365' : '#822727'};
`;

export const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  font-weight: bold;
  font-size: 14px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  background: #f7fafc;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #edf2f7;
`;

// Messages
export const ErrorText = styled.p`
  color: #e53e3e;
  font-size: 13px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const SuccessMessage = styled.div`
  background-color: #f0fff4;
  color: #276749;
  border-left: 5px solid #48bb78;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

// File input label
export const FileInputLabel = styled.label`
  background-color: ${props => props.bgColor || "#4a5568"};
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.hoverColor || "#2d3748"};
    transform: translateY(-1px);
  }

  input {
    display: none;
  }
`;

// Modal
export const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 40px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalFadeIn 0.3s ease-out forwards;

  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 25px;
  font-size: 28px;
  border: none;
  background: none;
  cursor: pointer;
  color: #a0aec0;
  transition: color 0.2s;
  
  &:hover {
    color: #e53e3e;
  }
`;

export const SectionDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e2e8f0;
  margin: 30px 0;
`;
