import { Link } from 'react-router-dom'
import { Button } from './button'

export function ButtonLink({ to, href, children, ...props }) {
  if (to) {
    return (
      <Button render={<Link to={to} />} {...props}>
        {children}
      </Button>
    )
  }
  return (
    <Button render={<a href={href} />} {...props}>
      {children}
    </Button>
  )
}
