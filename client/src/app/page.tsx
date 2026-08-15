import Link from 'next/link';
import React from 'react'

function page() {
  return (
    <div>
      <ul>
        <li>
          <Link href={'/chat'}>
            Chat</Link>
        </li>
      </ul>
    </div>
  )
}

export default page