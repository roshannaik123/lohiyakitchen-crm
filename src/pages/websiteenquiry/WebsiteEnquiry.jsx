import { Card, Input, Spin } from "antd";
import { useState } from "react";
import { WEBSITE_ENQUIRY } from "../../api";
import WebsiteTable from "../../components/websiteenquiry/WebsiteTable";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";

const { Search } = Input;
const WebsiteEnquiry = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading: isMutating } = useGetApiMutation({
    url: WEBSITE_ENQUIRY,
    queryKey: ["websitelist"],
  });
  const filteredUsers = data?.data
    ?.map((user) => {
      const flatString = Object.values(user)
        .filter((v) => typeof v === "string" || typeof v === "number")
        .join(" ")
        .toLowerCase();

      const matched = flatString.includes(searchTerm.toLowerCase());

      return matched ? { ...user, _match: searchTerm } : null;
    })
    .filter(Boolean);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[#006666]">Website Enquiry</h2>

        <div className="flex-1 flex gap-4 sm:justify-end">
          <Search
            placeholder="Search"
            allowClear
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            className="max-w-sm"
            autoFocus
          />
        </div>
      </div>
      <div className="min-h-[26rem]">
        {isMutating ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <WebsiteTable website={filteredUsers} />
        ) : (
          <div className="text-center text-gray-500 py-20">No users found.</div>
        )}
      </div>
    </Card>
  );
};

export default WebsiteEnquiry;
