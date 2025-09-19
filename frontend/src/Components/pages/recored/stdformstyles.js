import styled from "styled-components";


// Page container
export const PageContainer = styled.div`
  padding: 20px;
  max-width: 1300px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

// Sections
export const SectionContainer = styled.div`
  background: #fff;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 25px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
`;

// Titles
export const SubTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 15px;
  color: #2d3748;
  border-bottom: 2px solid #3182ce;
  padding-bottom: 5px;
`;

// Input fields
export const Input = styled.input`
  border: 1px solid ${props => props.error ? "#e53e3e" : "#cbd5e0"};
  border-radius: 10px;
  padding: 12px 14px;
  width: 260px;
  transition: all 0.2s;
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(66,153,225,0.2);
  }
`;

// Buttons
export const Button = styled.button`
  background-color: ${props => props.bgColor || "#3182ce"};
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: ${props => props.hoverColor || "#2b6cb0"};
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0px);
  }
`;

// Table
export const TableContainer = styled.div`
  overflow-x: auto;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.08);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const THead = styled.thead``;
export const TR = styled.tr``;
export const TH = styled.th`
  border: 1px solid #e2e8f0;
  padding: 14px;
  text-align: left;
  background-color: #edf2f7;
  font-weight: 700;
`;
export const TD = styled.td`
  border: 1px solid #e2e8f0;
  padding: 12px;
`;

// Messages
export const ErrorText = styled.p`
  color: #e53e3e;
  font-size: 13px;
  margin-top: 4px;
`;

export const SuccessMessage = styled.p`
  background-color: #f0fff4;
  color: #38a169;
  border: 1px solid #38a169;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
`;

// File input label
export const FileInputLabel = styled.label`
  background-color: #3182ce;
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
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
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: #fff;
  border-radius: 20px;
  width: 95%;
  max-width: 750px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 30px 40px;
  position: relative;
  box-shadow: 0 15px 35px rgba(0,0,0,0.25);
  animation: fadeIn 0.3s ease;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 20px;
  font-size: 26px;
  font-weight: bold;
  border: none;
  background: none;
  cursor: pointer;
  color: #718096;
  &:hover {
    color: #e53e3e;
  }
`;

// Divider for modal sections
export const SectionDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e2e8f0;
  margin: 20px 0;
`;
