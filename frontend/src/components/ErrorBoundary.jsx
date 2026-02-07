import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 max-w-2xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-red-700 mb-4">Something went wrong.</h1>
                    <p className="text-red-600 mb-4">The application crashed due to the following error:</p>
                    <div className="bg-white p-4 rounded border border-red-100 overflow-auto max-h-60 mb-4">
                        <code className="text-sm font-mono text-red-800 block mb-2">
                            {this.state.error && this.state.error.toString()}
                        </code>
                        <pre className="text-xs font-mono text-gray-500 whitespace-pre-wrap">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
