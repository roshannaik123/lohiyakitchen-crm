
import React from "react";
import useFinalUserImage from "../common/Logo";
import { IdCard, LocateIcon, Mail, Phone } from "lucide-react";

const OrderViewHeader = () => {
  const finalUserImage = useFinalUserImage();

  const orderData = {
    "order": {
      "id": 8,
      "order_year": "2025-26",
      "order_date": "2025-07-21",
      "order_no": "1008",
      "order_ref_number": "LOH-2025-26-1008",
      "name": 'Sajid Hussain',
      "mobile_no": '987654321',
      "Address": "JayaDeva",
      "delivery_address_id": 6,
      "delivery_instructions": "Please deliver after 5pm. Ring the bell twice.",
      "total_amount": "906.00",
      "discount_amount": "23.00",
    },
    "orderSub": [
      {
        "id": 12,
        "order_sub_ref_number": "LOH-2025-26-1008",
        "order_date": "2025-07-21",
        "product_name": 'Boost',
        "product_price": "43.00",
        "product_qnty": "1",
        "order_sub_status": "pending",
      },
      {
        "id": 13,
        "order_sub_ref_number": "LOH-2025-26-1008",
        "order_date": "2025-07-21",
        "product_name": 'Horlick',
        "product_price": "443.00",
        "product_qnty": "2",
        "order_sub_status": "pending",
      },
    ]
  };

  

  const calculateTotal = () => {
    return orderData.orderSub.reduce((sum, item) => {
      return sum + (parseFloat(item.product_price) * parseInt(item.product_qnty));
    }, 0);
  };

  const subtotal = calculateTotal();
  const discount = parseFloat(orderData.order.discount_amount);
  const grandTotal = subtotal - discount;

  return (
    <div  className="relative bg-white max-w-4xl mx-auto p-6 border border-gray-400 rounded-lg shadow-sm space-y-8">

<div className="absolute right-4 top-4 bg-blue-100 text-blue-800 font-semibold text-xs px-3 py-1 rounded-lg shadow-sm border border-blue-300">
  Order Copy
</div>


      {/*  Header with logo and company info */}
      <div className="flex gap-6 items-center border-b border-gray-400 rounded-bl-lg">
     
        <div className="w-32 h-32 flex-shrink-0 border-t border-l border-r  border-gray-400 rounded-lg overflow-hidden">
          <img
            src={finalUserImage}
            alt="User"
            className="object-contain w-full h-full p-2 bg-white"
          />
        </div>

     
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-gray-800">Lohiya Kitchen</h1>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#1c8fc7]" />
              <span className="font-medium">lohiya@example.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#1c8fc7]" />
              <span className="font-medium">+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2 ">
              <LocateIcon className="w-5 h-5 text-[#1c8fc7]" />
              <span className="font-medium">71 Pennington Lane Vernon Rockville, CT 06066</span>
            </div>
            <div className="flex items-center gap-2">
              <IdCard className="w-5 h-5 text-[#1c8fc7]" />
              <span className="font-medium">AABCU9603R</span>
            </div>
          </div>
        </div>
      </div>

      {/*Order info */}
      {/* border-b  */}
      <div className="flex justify-between   ">
      
        <div className="">
          {/* <h2 className="text-lg font-semibold text-gray-800">Customer Details</h2> */}
          <div className="text-gray-700 ">
            <p className="font-medium pb-0 ">{orderData.order.name}</p>
            <p>Phone: {orderData.order.mobile_no}</p>
            <p>Address: {orderData.order.Address}</p>
          </div>
        </div>

   
        <div className=" text-right">
          {/* <h2 className="text-lg font-semibold text-gray-800">Order Details</h2> */}
          <div className="text-gray-700">
            <p>Date: {orderData.order.order_date}</p>
            <p>Order #: {orderData.order.order_ref_number}</p>
          </div>
        </div>
      </div>
     

      {/* Order items table */}
      <div className="border-b border-gray-400 pb-2">
        {/* <h2 className="text-lg  font-medium text-gray-800 mb-3">Order Items</h2> */}
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-right">Qty</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orderData.orderSub.map((item) => (
              // border-b
              <tr key={item.id} className="">  
                <td className="px-4 py-2">{item.product_name}</td>
                <td className="px-4 py-2 text-right">₹{item.product_price}</td>
                <td className="px-4 py-2 text-right">{item.product_qnty}</td>
                <td className="px-4 py-2 text-right">
                  ₹{(parseFloat(item.product_price) * parseInt(item.product_qnty)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-between border-b border-gray-400 pb-1">
  
        <div>
          <p className="font-medium">Amount in words:</p>
          <div className="grid grid-cols-1 ">
          <p className="text-gray-700 ">
          Nine Hundred Six Rupees Only
          Nine Hundred Six Rupees Only
          </p>
          <span className="text-xs mt-8 ">
                *All Prices are including Gst
              </span>
              </div>
        </div>

     
        <div className="w-64">
          <div className="flex justify-between py-1">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Discount:</span>
            <span>- ₹{discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 border-t font-semibold">
            <span>Grand Total:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
           
               
      {/*  Delivery and signature */}
      <div className="flex justify-between pt-4">
  
        <div className="w-1/2">
          <h3 className="font-semibold">Delivery Instructions:</h3>
          <p className="text-gray-700">{orderData.order.delivery_instructions}</p>
        </div>

   
        <div className="w-1/2 text-right">
          <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-400 inline-block px-8">
            <p className="font-medium">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderViewHeader;