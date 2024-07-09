// pages/admin.js
import { useState } from 'react';
import CategoryAdmin from '../components/adminForms/categoryAdminForm';
import AuthorAdmin from '../components/adminForms/authorAdminForm';
import ArticleAdmin from '../components/adminForms/articleAdminForm';
import Link from 'next/link';


export default function AdminPage() {
    const [isCategoryAdminOpen, setIsCategoryAdminOpen] = useState(false);
    const [isAuthorAdminOpen, setIsAuthorAdminOpen] = useState(false);

    const toggleCategoryAdmin = () => {
        setIsCategoryAdminOpen(!isCategoryAdminOpen);
        setIsAuthorAdminOpen(false);
    };

    const toggleAuthorAdmin = () => {
        setIsAuthorAdminOpen(!isAuthorAdminOpen);
        setIsCategoryAdminOpen(false);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-xl font-bold text-center mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div onClick={toggleCategoryAdmin} className="cursor-pointer">
                        <h2 className="text-lg font-semibold">Category Admin</h2>
                    </div>
                    {isCategoryAdminOpen && <CategoryAdmin />}
                </div>
                <div>
                    <div onClick={toggleAuthorAdmin} className="cursor-pointer">
                        <h2 className="text-lg font-semibold">Author Admin</h2>
                    </div>
                    {isAuthorAdminOpen && <AuthorAdmin />}
                </div>
                <div className="md:col-span-2"> 
                    <ArticleAdmin />
                </div>
            </div>
            <div className="md:col-span-2 text-center">
                    <Link href="/admin/articles" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                        Manage Articles
                    </Link>
                </div>
        </div>
    );
    
}