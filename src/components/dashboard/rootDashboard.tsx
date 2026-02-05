import OfflineBanner from '@/components/common/offlinebanner';

const RootDashboard = () => {
    return (
        <div className="container mx-auto">
        <OfflineBanner/>
        <div className="flex justify-center items-center py-20">
            <p className="col-span-full text-center text-gray-500">
              No companies found.
            </p>
        </div>
        </div>
        
    )
}

export default RootDashboard;