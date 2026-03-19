export default function EthicalUsePolicy() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Ethical Use Policy</h1>
      
      <div className="space-y-4 mt-6">
        <p>
          EasyInvoice is open source software released under the MIT Licence.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-4">Uses We Do Not Welcome</h2>
        <p className="mb-4">
          While the MIT Licence does not legally restrict any use, the author explicitly does not want EasyInvoice used for:
        </p>

        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Military operations, installations, or equipment</li>
          <li>Weapons development, targeting systems, or surveillance infrastructure</li>
          <li>Law enforcement surveillance, crowd monitoring, or facial recognition</li>
          <li>Border control or immigration enforcement systems</li>
          <li>Propaganda or disinformation campaigns</li>
          <li>Any application designed to harm, control, or monitor people without their knowledge or consent</li>
        </ul>

        <p className="mt-6 border-l-4 border-indigo-500 pl-4 italic text-slate-600 dark:text-slate-400">
          These are not legally enforceable restrictions. They are a clear statement of intent. If your use case falls into the categories above, you are asked — sincerely — not to use this software.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-4">In Short</h2>
        <p>
          Build things that bring people together. Use this software to facilitate fair and equitable business. 
        </p>
        <p className="font-medium mt-4">
          Not in spaces designed to monitor, harm, or control them.
        </p>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
          <p>— JoeMighty</p>
          <a href="https://github.com/JoeMighty" target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors">github.com/JoeMighty</a>
        </div>
      </div>
    </div>
  )
}
