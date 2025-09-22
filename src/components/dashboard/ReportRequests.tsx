const requests = {
  open: [
    { id: 101, player: "Jérémy Doku", deadline: "2023-11-15" },
    { id: 102, player: "Xavi Simons", deadline: "2023-11-20" },
  ],
  inProgress: [
    { id: 103, player: "Cole Palmer", deadline: "2023-11-10" },
  ],
  inReview: [
    { id: 104, player: "Evan Ferguson", deadline: "2023-11-05" },
  ],
};

const columns = [
  { id: "open", title: "Ouvert", requests: requests.open },
  { id: "inProgress", title: "En cours", requests: requests.inProgress },
  { id: "inReview", title: "En attente de review", requests: requests.inReview },
];

export function ReportRequests() {
  return (
    <div className="bg-slate-900/50 rounded-2xl ring-1 ring-white/10 shadow-md p-6">
      <h3 className="text-white font-semibold mb-4">Demandes de rapports personnels</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-accent mb-4 text-sm uppercase tracking-wider">{column.title}</h4>
            <div className="flex flex-col gap-4">
              {column.requests.map((request) => (
                <div key={request.id} className="bg-slate-900 rounded-md p-3 ring-1 ring-slate-700">
                  <p className="font-semibold text-white">{request.player}</p>
                  <p className="text-xs text-slate-400 mt-1">Date limite : {request.deadline}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
