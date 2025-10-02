import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="h-screen flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-7xl font-bold">404</h1>
            <p className="mb-4 text-muted-foreground">
                holy crap lois!
                
                this is worse than the time i got a 404 error!
            </p>
            <Link to="/" className="underline text-primary">
                go home →
            </Link>
        </div>
    );
}