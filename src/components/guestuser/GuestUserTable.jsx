import { Tooltip } from "antd";
import STTable from "../STTable/STTable";

const GuestUserTable = ({ users }) => {
  const highlightMatch = (text, match) => {
    if (!match || !text) return text;
    const regex = new RegExp(`(${match})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === match.toLowerCase() ? (
        <mark
          key={index}
          className="bg-[#006666] text-white px-1 rounded"
          style={{ backgroundColor: "#006666", color: "white" }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const columns = [
    {
      title: "Firm Name",
      dataIndex: "firm_name",
      key: "firm_name",
      render: (_, user) => highlightMatch(user.firm_name, user._match),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, user) => highlightMatch(user.name, user._match),
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      render: (_, user) => (
        <a href={`tel:${user.mobile}`}>
          {highlightMatch(user.mobile, user._match)}
        </a>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (_, user) => (
        <Tooltip title={user.email}>
          {highlightMatch(user.email, user._match)}
        </Tooltip>
      ),
    },
  ];

  return <STTable data={users} columns={columns} />;
};

export default GuestUserTable;
